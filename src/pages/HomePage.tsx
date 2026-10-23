import { Check, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import DateField from '../components/DateField';
import SiteFooter from '../components/SiteFooter';
import SiteNoticeBanner from '../components/SiteNoticeBanner';
import HomeYoutubeLive from '../components/home/HomeYoutubeLive';
import TimeField from '../components/TimeField';
import { pickupPin, pickupPinsFor, type PickupPinId } from '../data/pickupPins';
import { applyKakaoLogin } from '../lib/members';
import { hasSignupCoupon, MEMBER_DISCOUNT_WON, readMember, subscribeMember } from '../lib/memberSession';
import { socialLoginErrorMessage } from '../lib/socialAuth';
import { listParkingCompareCompanies } from '../lib/parkingCompare';
import type { BookingSearch, Company, Reservation, Terminal } from '../types';
import { cn } from '../utils/cn';
import { buildPartnerPriceList, type PricedCompany } from '../utils/compareSort';
import { formatStayPhrase, todayYmd } from '../utils/dates';
import { displayCompanyName } from '../utils/display';
import { PARKING_LABEL_INDOOR, PARKING_LABEL_OUTDOOR } from '../utils/parkingType';
import { companyMatchesHandoff, getParkingDayCount } from '../utils/pricing';
import { resolveParkingDistanceEntry } from '../utils/parkingDistances';
import { fetchReservationById } from '../lib/reservations';
import {
  fetchReviewSnapshotsByCompanyIds,
  type CompanyReviewSnapshot,
} from '../lib/reviews';
import { displayInsuranceBadgeLabel } from '../utils/insurance';
import { useAffiliateOffer } from '../context/AffiliateContext';

/** 카드에 평점을 보여 주는 최소 후기 수. 이보다 적으면 한 줄에서 뺀다. */
const MIN_CARD_REVIEW_COUNT = 5;

const ACTIVE_STATUSES = new Set([
  'pending',
  'scheduled',
  'pending_in',
  'checked_in',
  'completed_in',
  'request_out',
]);
const USED_STATUSES = new Set([
  'checked_in',
  'completed_in',
  'request_out',
  'checked_out',
  'completed_out',
]);

function reservationRecency(reservation: Reservation): string {
  return reservation.checkedInAt || reservation.createdAt || reservation.departureDate;
}

function reservationMatchesSearch(
  reservation: Reservation,
  search: BookingSearch,
  meetHandoff: boolean
): boolean {
  const terminal = reservation.departureTerminal === 'T2' ? 'T2' : 'T1';
  if (terminal !== search.terminal) return false;
  if (Boolean(reservation.isIndoor) !== search.isIndoor) return false;
  return Boolean(reservation.faceToFace) === meetHandoff;
}

export default function HomePage({
  search,
  onSearchChange,
  companies,
  loading,
  onBook,
}: {
  search: BookingSearch;
  onSearchChange: (next: BookingSearch) => void;
  companies: Company[];
  loading: boolean;
  onBook: (company: Company, price: number) => void;
}) {
  const { offer } = useAffiliateOffer();
  const affiliateDiscountWon = offer?.customerDiscountWon ?? 0;
  const [memberOn, setMemberOn] = useState(() => Boolean(readMember()));
  const [reservationKey, setReservationKey] = useState(
    () => (readMember()?.reservationIds ?? []).join('|')
  );
  const [memberReservations, setMemberReservations] = useState<Reservation[]>([]);
  const [reviewById, setReviewById] = useState<Record<string, CompanyReviewSnapshot>>({});
  const [signupCoupon, setSignupCoupon] = useState(() => hasSignupCoupon(readMember()));
  const [authBusy, setAuthBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const today = todayYmd();
  const pickupId: PickupPinId = search.pickupPointId ?? 'short';
  const pins = pickupPinsFor(search.terminal);
  const selected = pickupPin(search.terminal, pickupId);
  const visiblePins = search.isIndoor ? pins.filter((pin) => pin.meetHandoff) : pins;

  useEffect(
    () =>
      subscribeMember(() => {
        const member = readMember();
        setMemberOn(Boolean(member));
        setSignupCoupon(hasSignupCoupon(member));
        setReservationKey((member?.reservationIds ?? []).join('|'));
      }),
    []
  );

  useEffect(() => {
    const ids = reservationKey ? reservationKey.split('|').filter(Boolean) : [];
    if (!memberOn || ids.length === 0) {
      setMemberReservations([]);
      return;
    }
    let cancelled = false;
    void Promise.all(ids.map((id) => fetchReservationById(id))).then((rows) => {
      if (cancelled) return;
      setMemberReservations(rows.filter((row): row is Reservation => Boolean(row)));
    });
    return () => {
      cancelled = true;
    };
  }, [memberOn, reservationKey]);

  const usedReservations = useMemo(() => {
    return memberReservations
      .filter((row) => USED_STATUSES.has(row.status))
      .sort((a, b) => reservationRecency(b).localeCompare(reservationRecency(a)));
  }, [memberReservations]);

  const upcoming = useMemo(() => {
    const rows = memberReservations
      .filter((row) => ACTIVE_STATUSES.has(row.status))
      .sort((a, b) => `${a.departureDate} ${a.departureTime}`.localeCompare(`${b.departureDate} ${b.departureTime}`));
    return rows[0] ?? null;
  }, [memberReservations]);

  const latestUsed = usedReservations[0] ?? null;
  const pastMatches = useMemo(() => {
    const seen = new Set<string>();
    const rows: Reservation[] = [];
    for (const row of usedReservations) {
      if (seen.has(row.companyId)) continue;
      if (!reservationMatchesSearch(row, search, selected.meetHandoff)) continue;
      seen.add(row.companyId);
      rows.push(row);
    }
    return rows;
  }, [search, selected.meetHandoff, usedReservations]);

  useEffect(() => {
    if ((search.pickupPointId ?? 'short') !== 'short' || !search.isIndoor) return;
    onSearchChange({ ...search, isIndoor: false, faceToFace: false, pickupPointId: 'short' });
    // 비대면 업체는 야외만 있어서, 첫 화면은 야외로 연다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const priced = useMemo(
    () =>
      priceCompanies(companies, search, selected.meetHandoff, pickupId, affiliateDiscountWon, signupCoupon),
    [affiliateDiscountWon, companies, pickupId, search, selected.meetHandoff, signupCoupon]
  );

  const lotPriceLine = useMemo(() => {
    const cheapest = (indoor: boolean) => {
      const face = indoor ? true : selected.meetHandoff;
      const pin = indoor ? 'depart' : pickupId;
      const open = priceCompanies(
        companies,
        { ...search, isIndoor: indoor },
        face,
        pin,
        affiliateDiscountWon,
        signupCoupon
      ).filter((item) => !item.soldOut);
      return open.length > 0 ? Math.min(...open.map((item) => item.price)) : null;
    };
    const parts: string[] = [];
    const indoor = cheapest(true);
    const outdoor = cheapest(false);
    if (indoor != null) parts.push(`${PARKING_LABEL_INDOOR} ${indoor.toLocaleString()}원부터`);
    if (outdoor != null) parts.push(`${PARKING_LABEL_OUTDOOR} ${outdoor.toLocaleString()}원부터`);
    if (parts.length === 0) return '';
    parts.push(`${PARKING_LABEL_INDOOR}는 대면만`);
    return parts.join(' · ');
  }, [affiliateDiscountWon, companies, pickupId, search, selected.meetHandoff, signupCoupon]);

  const companySectionRef = useRef<HTMLElement>(null);

  const pricedIds = priced.map((item) => item.company.id).join('|');
  useEffect(() => {
    const ids = pricedIds ? pricedIds.split('|').filter(Boolean) : [];
    if (ids.length === 0) {
      setReviewById({});
      return;
    }
    let cancelled = false;
    void fetchReviewSnapshotsByCompanyIds(ids).then((map) => {
      if (!cancelled) setReviewById(map);
    });
    return () => {
      cancelled = true;
    };
  }, [pricedIds]);

  const companyGroups = useMemo(() => {
    const byId = new Map(priced.map((item) => [item.company.id, item]));
    const pinnedItems = pastMatches
      .map((row) => byId.get(row.companyId))
      .filter((item): item is (typeof priced)[number] => Boolean(item));
    const pinnedIds = new Set(pinnedItems.map((item) => item.company.id));
    const marks: Record<string, string> = {};
    if (pinnedItems.length === 1) marks[pinnedItems[0].company.id] = '지난번 이용';
    if (pinnedItems.length > 1) marks[pinnedItems[0].company.id] = '지난번';
    return {
      pinnedItems,
      rest: priced.filter((item) => !pinnedIds.has(item.company.id)),
      marks,
      split: pinnedItems.length > 1,
    };
  }, [pastMatches, priced]);

  const showPastLine = Boolean(
    latestUsed && !reservationMatchesSearch(latestUsed, search, selected.meetHandoff)
  );

  const applyPastStay = (reservation: Reservation) => {
    const terminal: Terminal = reservation.departureTerminal === 'T2' ? 'T2' : 'T1';
    const indoor = Boolean(reservation.isIndoor);
    const face = indoor ? true : Boolean(reservation.faceToFace);
    onSearchChange({
      ...search,
      terminal,
      arrivalTerminal: terminal,
      isIndoor: indoor,
      faceToFace: face,
      pickupPointId: face ? 'depart' : 'short',
    });
  };

  const setTerminal = (terminal: Terminal) => {
    const pin = pickupPin(terminal, pickupId);
    onSearchChange({
      ...search,
      terminal,
      arrivalTerminal: search.arrivalTerminal && search.arrivalTerminal !== search.terminal
        ? search.arrivalTerminal
        : terminal,
      pickupPointId: pickupId,
      faceToFace: pin.meetHandoff,
    });
  };

  const setPickup = (id: PickupPinId) => {
    const pin = pickupPin(search.terminal, id);
    onSearchChange({
      ...search,
      pickupPointId: id,
      faceToFace: pin.meetHandoff,
      isIndoor: pin.meetHandoff ? search.isIndoor : false,
    });
  };

  const setLot = (indoor: boolean) => {
    if (!indoor || selected.meetHandoff) {
      onSearchChange({ ...search, isIndoor: indoor });
      return;
    }
    onSearchChange({
      ...search,
      isIndoor: true,
      pickupPointId: 'depart',
      faceToFace: true,
    });
  };

  return (
    <div className="bg-white pb-[calc(8rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-lg space-y-5 px-4 pt-2 md:pt-8">
        <section className="space-y-2 md:space-y-8">
          <SiteNoticeBanner />
          {upcoming ? (
            <p className="text-[14px] font-semibold text-[#0f1a2e]">
              {upcoming.departureDate.slice(5).replace('-', '.')} {displayCompanyName(upcoming.companyName)} 예약이
              있습니다.
            </p>
          ) : null}
          <div>
            <ChoiceLabel>터미널</ChoiceLabel>
            <div className="grid grid-cols-2 gap-2">
              {(['T1', 'T2'] as const).map((terminal) => {
                const on = search.terminal === terminal;
                const blue = terminal === 'T1';
                return (
                  <ChoiceRow
                    key={terminal}
                    selected={on}
                    label={blue ? '제1터미널' : '제2터미널'}
                    art={blue ? '/pickup/terminal-t1.jpg?v=3' : '/pickup/terminal-t2.jpg?v=3'}
                    onClick={() => setTerminal(terminal)}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <ChoiceLabel>주차장</ChoiceLabel>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { indoor: true, label: PARKING_LABEL_INDOOR, art: '/pickup/indoor.jpg?v=1' },
                  { indoor: false, label: PARKING_LABEL_OUTDOOR, art: '/pickup/outdoor.jpg?v=2' },
                ] as const
              ).map((lot) => (
                <ChoiceRow
                  key={lot.label}
                  selected={search.isIndoor === lot.indoor}
                  label={lot.label}
                  art={lot.art}
                  onClick={() => setLot(lot.indoor)}
                />
              ))}
            </div>
            {lotPriceLine ? (
              <p className="mt-1.5 text-[14px] font-medium text-[#0f1a2e]/55">{lotPriceLine}</p>
            ) : null}
          </div>

          <div>
            <ChoiceLabel>픽업지</ChoiceLabel>
            <ValetCards pins={visiblePins} selected={selected} onSelect={setPickup} />
          </div>

          <div>
            <ChoiceLabel>날짜</ChoiceLabel>
            <div className="grid grid-cols-2 gap-2">
              <DateField
                tone="premium"
                size="large"
                label="맡기는 날"
                value={search.departureDate}
                min={today}
                onChange={(departureDate) => {
                  const next = { ...search, departureDate };
                  if (next.arrivalDate < departureDate) next.arrivalDate = departureDate;
                  onSearchChange(next);
                }}
              />
              <TimeField
                tone="premium"
                size="large"
                label="맡기는 시간"
                value={search.departureTime}
                onChange={(departureTime) => onSearchChange({ ...search, departureTime })}
              />
              <DateField
                tone="premium"
                size="large"
                label="찾는 날"
                value={search.arrivalDate}
                min={search.departureDate}
                onChange={(arrivalDate) => onSearchChange({ ...search, arrivalDate })}
              />
              <TimeField
                tone="premium"
                size="large"
                label="찾는 시간"
                value={search.arrivalTime}
                onChange={(arrivalTime) => onSearchChange({ ...search, arrivalTime })}
              />
              <p className="col-span-2 flex justify-start pt-0 md:pt-1">
                {!loading && priced.length > 0 ? (
                  <button
                    type="button"
                    onClick={() =>
                      companySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                    className="inline-flex items-center gap-0.5 rounded-full bg-gold/10 py-1 pl-3 pr-2 text-[13px] font-bold text-gold"
                  >
                    총 {stayLabel(search.departureDate, search.arrivalDate)} · {priced.length}곳 보기
                    <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
                  </button>
                ) : (
                  <span className="rounded-full bg-gold/10 px-3 py-1 text-[13px] font-bold text-gold">
                    총 {stayLabel(search.departureDate, search.arrivalDate)}
                  </span>
                )}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section
        ref={companySectionRef}
        className="mx-auto mt-8 max-w-lg scroll-mt-[calc(var(--app-header-h,60px)+0.75rem)] px-4"
      >
        {memberOn ? null : (
          <div className="mb-5">
            <button
              type="button"
              disabled={authBusy}
              onClick={() => {
                setAuthBusy(true);
                setLoginError('');
                void applyKakaoLogin()
                  .catch((err) => {
                    console.error('kakao login failed', err);
                    setLoginError(socialLoginErrorMessage(err) || '로그인에 실패했습니다.');
                  })
                  .finally(() => setAuthBusy(false));
              }}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#FEE500] px-4 py-3.5 text-left active:scale-[0.99] disabled:opacity-60"
            >
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-[#191919]/70">카카오 로그인하면</span>
                <span className="mt-0.5 block text-[17px] font-bold leading-snug text-[#191919]">
                  {authBusy
                    ? '로그인 중…'
                    : `아래 가격에서 첫 예약 ${MEMBER_DISCOUNT_WON.toLocaleString()}원 할인`}
                </span>
              </span>
              <ChevronRight size={20} strokeWidth={2.5} className="shrink-0 text-[#191919]" aria-hidden />
            </button>
            {loginError ? (
              <p className="mt-2 text-[13px] font-semibold text-rose-500">{loginError}</p>
            ) : null}
          </div>
        )}
        {loading ? (
          <p className="text-[16px] font-semibold text-[#0f1a2e]">업체를 불러오는 중입니다.</p>
        ) : (
          <>
            <ChoiceLabel>{`이용 가능 업체 ${priced.length}곳`}</ChoiceLabel>
            {showPastLine && latestUsed ? (
              <button
                type="button"
                onClick={() => applyPastStay(latestUsed)}
                className="mb-3 block text-left text-[14px] font-semibold text-[#0f1a2e]"
              >
                지난번에는 {displayCompanyName(latestUsed.companyName)} ·{' '}
                {latestUsed.departureTerminal === 'T2' ? '제2터미널' : '제1터미널'}{' '}
                {latestUsed.isIndoor ? PARKING_LABEL_INDOOR : PARKING_LABEL_OUTDOOR}
              </button>
            ) : null}
            {companyGroups.split ? (
              <div className="space-y-4">
                <div>
                  <ChoiceLabel>이용한 업체</ChoiceLabel>
                  <PriceList
                    items={companyGroups.pinnedItems}
                    marks={companyGroups.marks}
                    reviews={reviewById}
                    stay={stayLabel(search.departureDate, search.arrivalDate)}
                    terminal={search.terminal}
                    isIndoor={search.isIndoor}
                    onBook={onBook}
                  />
                </div>
                {companyGroups.rest.length > 0 ? (
                  <div>
                    <ChoiceLabel>다른 업체</ChoiceLabel>
                    <PriceList
                      items={companyGroups.rest}
                      reviews={reviewById}
                      stay={stayLabel(search.departureDate, search.arrivalDate)}
                      terminal={search.terminal}
                      isIndoor={search.isIndoor}
                      onBook={onBook}
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <PriceList
                items={companyGroups.pinnedItems.length > 0 ? [...companyGroups.pinnedItems, ...companyGroups.rest] : priced}
                marks={companyGroups.marks}
                reviews={reviewById}
                stay={stayLabel(search.departureDate, search.arrivalDate)}
                terminal={search.terminal}
                isIndoor={search.isIndoor}
                onBook={onBook}
              />
            )}
          </>
        )}
      </section>
      <div className="mx-auto mt-10 max-w-lg px-4">
        <HomeYoutubeLive />
      </div>
      <div className="mx-auto mt-10 max-w-6xl px-4 md:px-8">
        <SiteFooter tone="premium" />
      </div>
    </div>
  );
}

function priceCompanies(
  companies: Company[],
  search: BookingSearch,
  face: boolean,
  pickupId: PickupPinId,
  affiliateDiscountWon: number,
  signupCoupon: boolean
) {
  const list = buildPartnerPriceList(
    listParkingCompareCompanies(companies),
    { ...search, faceToFace: face, pickupPointId: pickupId },
    {},
    affiliateDiscountWon
  ).filter((item) => companyMatchesHandoff(item.company, face));
  return list
    .map((item) => ({
      ...item,
      listPrice: item.price,
      price: signupCoupon ? Math.max(0, item.price - MEMBER_DISCOUNT_WON) : item.price,
    }))
    .sort((a, b) => {
      if (a.soldOut !== b.soldOut) return a.soldOut ? 1 : -1;
      if (a.price !== b.price) return a.price - b.price;
      const reviews = (b.company.reviews_count || 0) - (a.company.reviews_count || 0);
      if (reviews !== 0) return reviews;
      return displayCompanyName(a.company.name).localeCompare(displayCompanyName(b.company.name), 'ko');
    });
}

function stayLabel(start: string, end: string): string {
  return formatStayPhrase(getParkingDayCount(start, end));
}

function ChoiceLabel({ children }: { children: string }) {
  return <p className="mb-1.5 text-[16px] font-bold text-[#0f1a2e] md:mb-3">{children}</p>;
}

function choiceCard(selected: boolean) {
  return cn(
    'relative flex h-[58px] w-full min-w-0 items-center gap-2 rounded-2xl pl-3 pr-8 text-left transition-colors duration-200 md:h-full md:px-3 md:pb-3 md:pt-8',
    selected ? 'bg-[#F3E6C4]' : 'bg-[#f4f5f7]'
  );
}

function ChoiceCheck() {
  return (
    <span className="pointer-events-none absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[#0f1a2e]">
      <Check size={12} strokeWidth={3} />
    </span>
  );
}

function ClayIcon({ src }: { src: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 md:h-14 md:w-14 md:p-2">
      <img src={src} alt="" className="h-full w-full object-contain" />
    </span>
  );
}

function ChoiceRow({
  selected,
  disabled = false,
  label,
  art,
  onClick,
}: {
  selected: boolean;
  disabled?: boolean;
  label: string;
  art: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(choiceCard(selected && !disabled), disabled && 'cursor-not-allowed opacity-40')}
    >
      <span className="min-w-0 flex-1 whitespace-nowrap text-[15px] font-semibold text-[#0f1a2e]">{label}</span>
      <ClayIcon src={art} />
      {selected && !disabled ? <ChoiceCheck /> : null}
    </button>
  );
}

function ValetCards({
  pins,
  selected,
  onSelect,
}: {
  pins: ReturnType<typeof pickupPinsFor>;
  selected: ReturnType<typeof pickupPin>;
  onSelect: (id: PickupPinId) => void;
}) {
  return (
    <div className="space-y-2 md:space-y-3">
      {pins.map((pin) => {
        const on = selected.id === pin.id;
        const remote = pin.id === 'short';
        const art = remote ? '/pickup/smart-valet.jpg?v=7' : '/pickup/comfort-valet.jpg?v=8';
        return (
          <button
            key={pin.id}
            type="button"
            onClick={() => onSelect(pin.id)}
            className={cn(choiceCard(on), 'h-[66px] pl-4 md:h-full md:px-4')}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-semibold text-[#0f1a2e]">{pin.action}</span>
              <span className="mt-0.5 block text-[14px] font-medium leading-snug text-[#0f1a2e]/55">{pin.detail}</span>
            </span>
            <ClayIcon src={art} />
            {on ? <ChoiceCheck /> : null}
          </button>
        );
      })}
    </div>
  );
}

function formatCardRating(rating: number): string {
  return (Math.round(rating * 10) / 10).toFixed(1);
}

function reviewSignature(snapshot?: CompanyReviewSnapshot): string | null {
  const reviews = snapshot?.count ?? 0;
  if (reviews < MIN_CARD_REVIEW_COUNT) return null;
  const rating =
    snapshot?.averageRating != null && snapshot.averageRating > 0
      ? formatCardRating(snapshot.averageRating)
      : '';
  return `${reviews}:${rating}`;
}

function companyCardFact(
  company: Company,
  terminal: Terminal,
  isIndoor: boolean,
  hideReview: boolean,
  snapshot?: CompanyReviewSnapshot
): string | null {
  const parts: string[] = [];
  const minutes = resolveParkingDistanceEntry(company, terminal, isIndoor)?.driveMinutes;
  if (minutes != null && minutes > 0) parts.push(`약 ${minutes}분`);
  if (displayInsuranceBadgeLabel(company)) parts.push('보험 가입');
  const reviews = snapshot?.count ?? 0;
  if (!hideReview && reviews >= MIN_CARD_REVIEW_COUNT) {
    const rating =
      snapshot?.averageRating != null && snapshot.averageRating > 0
        ? ` · ${formatCardRating(snapshot.averageRating)}`
        : '';
    parts.push(`후기 ${reviews}개${rating}`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

function lowestPriceId(items: Array<PricedCompany & { listPrice: number }>): string | null {
  const open = items.filter((item) => !item.soldOut);
  if (open.length < 2) return null;
  const cheapest = Math.min(...open.map((item) => item.price));
  const winners = open.filter((item) => item.price === cheapest);
  return winners.length === 1 ? winners[0].company.id : null;
}

function PriceList({
  items,
  stay,
  terminal,
  isIndoor,
  onBook,
  marks = {},
  reviews = {},
}: {
  items: Array<PricedCompany & { listPrice: number }>;
  stay: string;
  terminal: Terminal;
  isIndoor: boolean;
  onBook: (company: Company, price: number) => void;
  marks?: Record<string, string>;
  reviews?: Record<string, CompanyReviewSnapshot>;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-[#f4f5f7] px-4 py-4 text-[15px] font-medium leading-relaxed text-[#0f1a2e]/70">
        선택하신 조건에 이용 가능한 업체가 없어요. 조건을 변경해보세요.
      </p>
    );
  }
  const lowestId = lowestPriceId(items);
  const reviewCounts = new Map<string, number>();
  for (const item of items) {
    const key = reviewSignature(reviews[item.company.id]);
    if (!key) continue;
    reviewCounts.set(key, (reviewCounts.get(key) ?? 0) + 1);
  }
  return (
    <div className="space-y-2">
      {items.map(({ company, price, listPrice, soldOut }) => {
        const lowest = company.id === lowestId;
        const snapshot = reviews[company.id];
        const signature = reviewSignature(snapshot);
        const hideReview = signature != null && (reviewCounts.get(signature) ?? 0) > 1;
        return (
          <button
            key={company.id}
            type="button"
            disabled={soldOut}
            onClick={() => onBook(company, price)}
            className="flex min-h-[76px] w-full items-center justify-between gap-3 rounded-2xl bg-[#f4f5f7] px-4 py-4 text-left transition duration-150 active:scale-[0.98] disabled:opacity-40"
          >
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="text-[16px] font-bold text-[#0f1a2e]">{displayCompanyName(company.name)}</span>
                {marks[company.id] ? (
                  <span className="rounded-full bg-[#F3E6C4] px-2 py-0.5 text-[11px] font-bold text-[#0f1a2e]">
                    {marks[company.id]}
                  </span>
                ) : null}
                {lowest ? (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold">최저가</span>
                ) : null}
              </span>
              <span className="mt-1 block min-h-[1.15rem] text-[13px] font-medium text-[#0f1a2e]/55">
                {companyCardFact(company, terminal, isIndoor, hideReview, snapshot) ?? ''}
              </span>
            </span>
            {soldOut ? (
              <span className="shrink-0 text-[16px] font-bold text-[#0f1a2e]">마감</span>
            ) : (
              <span className="flex shrink-0 items-center gap-1 text-right tabular-nums">
                <span>
                  {listPrice > price ? (
                    <span className="block text-[13px] font-semibold text-[#0f1a2e]/55 line-through">
                      {listPrice.toLocaleString()}원
                    </span>
                  ) : null}
                  <span className="block text-[18px] font-bold text-[#0f1a2e]">{price.toLocaleString()}원</span>
                  <span className="block text-[13px] font-medium text-[#0f1a2e]/45">현장 결제</span>
                  <span className="block text-[13px] font-medium text-[#0f1a2e]/45">총 {stay} 기준</span>
                </span>
                <ChevronRight size={18} className="text-[#0f1a2e]/45" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
