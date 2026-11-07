import {
  Building2,
  BusFront,
  Car,
  Check,
  ChevronRight,
  Clock,
  EvCharger,
  Footprints,
  KeyRound,
  PlaneTakeoff,
  SquareParking,
  Shield,
  Star,
  Sun,
  Wallet,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import DateField from '../components/DateField';
import SiteFooter from '../components/SiteFooter';
import SiteNoticeBanner from '../components/SiteNoticeBanner';
import HomeYoutubeLive from '../components/home/HomeYoutubeLive';
import TimeField from '../components/TimeField';
import { pickupPin } from '../data/pickupPins';
import { applyKakaoLogin } from '../lib/members';
import { hasSignupCoupon, MEMBER_DISCOUNT_WON, readMember, subscribeMember } from '../lib/memberSession';
import { socialLoginErrorMessage } from '../lib/socialAuth';
import { listParkingCompareCompanies } from '../lib/parkingCompare';
import type { BookingSearch, Company, ParkingProductType, Reservation, Terminal } from '../types';
import { cn } from '../utils/cn';
import { buildPartnerPriceList, type PricedCompany } from '../utils/compareSort';
import { formatStayPhrase, todayYmd } from '../utils/dates';
import { displayCompanyName } from '../utils/display';
import { companyThumbnailUrl } from '../utils/imageUrl';
import { companyCardPhotoUrl } from '../utils/parkingLocation';
import { PARKING_LABEL_INDOOR, PARKING_LABEL_OUTDOOR } from '../utils/parkingType';
import { displayInsuranceLabel, getStatusLabel } from '../utils/trust';
import { shouldShowInsuranceBadge } from '../utils/trustDisplay';
import {
  findParkingProduct,
  parkingProductFacts,
  valetHandoffBadge,
  valetHandoffTitle,
} from '../utils/parkingProducts';
import { getParkingDayCount } from '../utils/pricing';
import { fetchReservationById } from '../lib/reservations';
import {
  fetchReviewSnapshotsByCompanyIds,
  type CompanyReviewSnapshot,
} from '../lib/reviews';
import { useAffiliateOffer } from '../context/AffiliateContext';

type HomeListSort = 'reviews' | 'price';

type LotSearch = { isIndoor: boolean; terminal: Terminal };

/** 대면 상품이 있으면 대면, 없으면 비대면 상품으로 보여 준다 */
function companyIsFaceHandoff(company: Company, search: LotSearch): boolean {
  return findParkingProduct(company, search, true) != null;
}

function handoffSearchPatch(
  company: Company,
  search: LotSearch
): Pick<BookingSearch, 'faceToFace' | 'pickupPointId'> {
  const face = companyIsFaceHandoff(company, search);
  return { faceToFace: face, pickupPointId: face ? 'depart' : 'short' };
}

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

function reservationMatchesSearch(reservation: Reservation, search: BookingSearch): boolean {
  const terminal = reservation.departureTerminal === 'T2' ? 'T2' : 'T1';
  if (terminal !== search.terminal) return false;
  return Boolean(reservation.isIndoor) === search.isIndoor;
}

export default function HomePage({
  search,
  onSearchChange,
  companies,
  loading,
  onDetail,
  onBook,
  lastReservationId,
  onOpenReservations,
}: {
  search: BookingSearch;
  onSearchChange: (next: BookingSearch) => void;
  companies: Company[];
  loading: boolean;
  /** 이번 방문에서 막 접수한 예약. 비회원은 창을 닫기 전까지만 있다. */
  lastReservationId: string | null;
  onOpenReservations: () => void;
  /** 자세히 — 업체 상세 시트 */
  onDetail: (company: Company, price: number) => void;
  /** 예약하기 — 바로 예약 모달 */
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
  const [listSort, setListSort] = useState<HomeListSort>('reviews');
  const [justBooked, setJustBooked] = useState<Reservation | null | undefined>(null);
  const today = todayYmd();

  useEffect(() => {
    if (!search.isIndoor) return;
    if (search.pickupPointId === 'depart' && search.faceToFace) return;
    onSearchChange({ ...search, pickupPointId: 'depart', faceToFace: true });
  }, [onSearchChange, search]);

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

  useEffect(() => {
    if (!lastReservationId) {
      setJustBooked(null);
      return;
    }
    let cancelled = false;
    setJustBooked(undefined);
    void fetchReservationById(lastReservationId).then((row) => {
      if (!cancelled) setJustBooked(row);
    });
    return () => {
      cancelled = true;
    };
  }, [lastReservationId]);

  const noticeReservation =
    justBooked && ACTIVE_STATUSES.has(justBooked.status)
      ? justBooked
      : justBooked === undefined
        ? null
        : upcoming;

  const latestUsed = usedReservations[0] ?? null;
  const pastMatches = useMemo(() => {
    const seen = new Set<string>();
    const rows: Reservation[] = [];
    for (const row of usedReservations) {
      if (seen.has(row.companyId)) continue;
      if (!reservationMatchesSearch(row, search)) continue;
      seen.add(row.companyId);
      rows.push(row);
    }
    return rows;
  }, [search, usedReservations]);

  const priced = useMemo(
    () => priceCompanies(companies, search, affiliateDiscountWon, signupCoupon),
    [affiliateDiscountWon, companies, search, signupCoupon]
  );

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
    const ordered = [...priced].sort((a, b) => compareHomeCompanies(a, b, reviewById, listSort));
    return {
      ordered,
      pinnedItems: ordered.filter((item) => pinnedIds.has(item.company.id)),
      rest: ordered.filter((item) => !pinnedIds.has(item.company.id)),
      marks,
      split: pinnedItems.length > 1,
    };
  }, [listSort, pastMatches, priced, reviewById]);

  const showPastLine = Boolean(latestUsed && !reservationMatchesSearch(latestUsed, search));

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
    onSearchChange({
      ...search,
      terminal,
      arrivalTerminal:
        search.arrivalTerminal && search.arrivalTerminal !== search.terminal
          ? search.arrivalTerminal
          : terminal,
    });
  };

  const setLot = (indoor: boolean) => {
    if (indoor) {
      onSearchChange({
        ...search,
        isIndoor: true,
        pickupPointId: 'depart',
        faceToFace: true,
      });
      return;
    }
    onSearchChange({ ...search, isIndoor: false });
  };

  const selectCompany = (company: Company, price: number, mode: 'detail' | 'book') => {
    onSearchChange({ ...search, ...handoffSearchPatch(company, search) });
    if (mode === 'detail') onDetail(company, price);
    else onBook(company, price);
  };

  return (
    <div className="bg-[#f4f6f8] pb-[calc(8rem+env(safe-area-inset-bottom))]">
      <section className="relative">
        <div className="relative h-[200px] overflow-hidden md:h-[260px]">
          <img
            src="/brand/home-why-airport-handoff.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0f1a2e] to-transparent" />
        </div>

        <div className="relative z-10 mx-auto -mt-14 max-w-lg px-4 md:max-w-3xl">
          <div className="space-y-4 rounded-[28px] bg-white p-4 shadow-[0_12px_40px_rgba(15,26,46,0.08)] ring-1 ring-[#0f1a2e]/6 md:p-5">
            <div>
              <ChoiceLabel>터미널 선택</ChoiceLabel>
              <div className="grid grid-cols-2 gap-2">
                {(['T1', 'T2'] as const).map((terminal) => (
                  <SelectPill
                    key={terminal}
                    selected={search.terminal === terminal}
                    label={terminal === 'T1' ? '제1터미널' : '제2터미널'}
                    icon={Building2}
                    onClick={() => setTerminal(terminal)}
                  />
                ))}
              </div>
            </div>

            <div>
              <ChoiceLabel>주차장 선택</ChoiceLabel>
              <div className="grid grid-cols-2 gap-2">
                <SelectPill
                  selected={search.isIndoor}
                  label={PARKING_LABEL_INDOOR}
                  icon={Warehouse}
                  onClick={() => setLot(true)}
                />
                <SelectPill
                  selected={!search.isIndoor}
                  label={PARKING_LABEL_OUTDOOR}
                  icon={Car}
                  onClick={() => setLot(false)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <ChoiceLabel>날짜</ChoiceLabel>
                <div className="space-y-2">
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
                  <DateField
                    tone="premium"
                    size="large"
                    label="찾는 날"
                    value={search.arrivalDate}
                    min={search.departureDate}
                    onChange={(arrivalDate) => onSearchChange({ ...search, arrivalDate })}
                  />
                </div>
              </div>
              <div>
                <ChoiceLabel>시간</ChoiceLabel>
                <div className="space-y-2">
                  <TimeField
                    tone="premium"
                    size="large"
                    label="맡기는 시간"
                    value={search.departureTime}
                    onChange={(departureTime) => onSearchChange({ ...search, departureTime })}
                  />
                  <TimeField
                    tone="premium"
                    size="large"
                    label="찾는 시간"
                    value={search.arrivalTime}
                    onChange={(arrivalTime) => onSearchChange({ ...search, arrivalTime })}
                  />
                </div>
              </div>
            </div>

            <div>
              {!loading && priced.length > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    companySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className="inline-flex items-center gap-0.5 rounded-full bg-gold/15 py-1.5 pl-3 pr-2 text-[13px] font-bold text-gold"
                >
                  총 {stayLabel(search.departureDate, search.arrivalDate)} · {priced.length}곳 보기
                  <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
                </button>
              ) : (
                <span className="rounded-full bg-gold/15 px-3 py-1.5 text-[13px] font-bold text-gold">
                  총 {stayLabel(search.departureDate, search.arrivalDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        ref={companySectionRef}
        className="mx-auto mt-8 max-w-lg scroll-mt-[calc(var(--app-header-h,60px)+0.75rem)] px-4 md:max-w-3xl"
      >
        <SiteNoticeBanner />
        {noticeReservation ? (
          <button
            type="button"
            onClick={onOpenReservations}
            className="mb-4 flex w-full items-center justify-between gap-3 text-left text-[14px] font-semibold text-[#0f1a2e]"
          >
            <span>
              {noticeReservation.departureDate.slice(5).replace('-', '.')}{' '}
              {displayCompanyName(noticeReservation.companyName)} · {getStatusLabel(noticeReservation.status)}
            </span>
            <ChevronRight size={16} className="shrink-0 text-[#0f1a2e]/45" />
          </button>
        ) : null}
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
            {priced.length > 1 ? (
              <div className="mb-3 flex gap-2">
                {(
                  [
                    { id: 'reviews' as const, label: '후기 많은 순' },
                    { id: 'price' as const, label: '최저가' },
                  ] as const
                ).map((option) => {
                  const on = listSort === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setListSort(option.id)}
                      className={cn(
                        'rounded-full px-3.5 py-1.5 text-[13px] font-bold transition',
                        on
                          ? 'bg-[#0f1a2e] text-white'
                          : 'bg-[#f4f5f7] text-[#0f1a2e]/70 ring-1 ring-[#0f1a2e]/8'
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
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
                    isIndoor={search.isIndoor}
                    terminal={search.terminal}
                    onDetail={(company, price) => selectCompany(company, price, 'detail')}
                    onBook={(company, price) => selectCompany(company, price, 'book')}
                  />
                </div>
                {companyGroups.rest.length > 0 ? (
                  <div>
                    <ChoiceLabel>다른 업체</ChoiceLabel>
                    <PriceList
                      items={companyGroups.rest}
                      reviews={reviewById}
                      stay={stayLabel(search.departureDate, search.arrivalDate)}
                      isIndoor={search.isIndoor}
                      terminal={search.terminal}
                      onDetail={(company, price) => selectCompany(company, price, 'detail')}
                      onBook={(company, price) => selectCompany(company, price, 'book')}
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <PriceList
                items={companyGroups.ordered}
                marks={companyGroups.marks}
                reviews={reviewById}
                stay={stayLabel(search.departureDate, search.arrivalDate)}
                isIndoor={search.isIndoor}
                terminal={search.terminal}
                onDetail={(company, price) => selectCompany(company, price, 'detail')}
                onBook={(company, price) => selectCompany(company, price, 'book')}
              />
            )}
          </>
        )}
      </section>
      <div className="mx-auto mt-10 max-w-lg px-4 md:max-w-3xl">
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
  affiliateDiscountWon: number,
  signupCoupon: boolean
) {
  const partners = listParkingCompareCompanies(companies).filter((company) => {
    const face = companyIsFaceHandoff(company, search);
    /** 실내는 대면 상품만 */
    if (search.isIndoor && !face) return false;
    return face || findParkingProduct(company, search, false) != null;
  });

  const list = partners
    .map((company) => {
      const face = companyIsFaceHandoff(company, search);
      const priced = buildPartnerPriceList(
        [company],
        {
          ...search,
          faceToFace: face,
          pickupPointId: face ? 'depart' : 'short',
        },
        {},
        affiliateDiscountWon
      )[0];
      return priced ?? null;
    })
    .filter((item): item is PricedCompany => item != null);

  return list
    .map((item) => ({
      ...item,
      listPrice: item.price,
      price: signupCoupon ? Math.max(0, item.price - MEMBER_DISCOUNT_WON) : item.price,
    }))
    .sort((a, b) => compareHomeCompanies(a, b, {}));
}

function compareHomeCompanies(
  a: { soldOut?: boolean; price: number; company: Company },
  b: { soldOut?: boolean; price: number; company: Company },
  reviews: Record<string, CompanyReviewSnapshot>,
  sort: HomeListSort = 'reviews'
): number {
  if (Boolean(a.soldOut) !== Boolean(b.soldOut)) return a.soldOut ? 1 : -1;
  const reviewDiff = (reviews[b.company.id]?.count ?? 0) - (reviews[a.company.id]?.count ?? 0);
  if (sort === 'price') {
    if (a.price !== b.price) return a.price - b.price;
    if (reviewDiff !== 0) return reviewDiff;
  } else {
    if (reviewDiff !== 0) return reviewDiff;
    if (a.price !== b.price) return a.price - b.price;
  }
  return displayCompanyName(a.company.name).localeCompare(displayCompanyName(b.company.name), 'ko');
}

function stayLabel(start: string, end: string): string {
  return formatStayPhrase(getParkingDayCount(start, end));
}

function ChoiceLabel({ children, className }: { children: string; className?: string }) {
  return (
    <p className={cn('mb-2 flex items-center gap-2 text-[15px] font-bold text-[#0f1a2e]', className)}>
      <span className="h-4 w-1 shrink-0 rounded-full bg-gold" aria-hidden />
      {children}
    </p>
  );
}

function SelectPill({
  selected,
  label,
  icon: Icon,
  onClick,
}: {
  selected: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-14 w-full items-center gap-2 rounded-2xl px-3.5 text-left transition-colors',
        selected ? 'bg-[#0f1a2e] text-white' : 'bg-[#f4f5f7] text-[#0f1a2e]'
      )}
    >
      {selected ? <Icon size={18} strokeWidth={2} className="shrink-0" aria-hidden /> : null}
      <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{label}</span>
      {selected ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-[#0f1a2e]">
          <Check size={14} strokeWidth={3} aria-hidden />
        </span>
      ) : (
        <Icon size={18} strokeWidth={2} className="shrink-0 text-[#0f1a2e]/55" aria-hidden />
      )}
    </button>
  );
}

function formatCardRating(rating: number): string {
  return (Math.round(rating * 10) / 10).toFixed(1);
}

function lowestPriceId(items: Array<PricedCompany & { listPrice: number }>): string | null {
  const open = items.filter((item) => !item.soldOut);
  if (open.length < 2) return null;
  const cheapest = Math.min(...open.map((item) => item.price));
  const winners = open.filter((item) => item.price === cheapest);
  return winners.length === 1 ? winners[0].company.id : null;
}

function mostReviewedId(
  items: Array<PricedCompany & { listPrice: number }>,
  reviews: Record<string, CompanyReviewSnapshot>
): string | null {
  const open = items.filter((item) => !item.soldOut);
  if (open.length < 2) return null;
  let bestId: string | null = null;
  let bestCount = 0;
  let tie = false;
  for (const item of open) {
    const count = reviews[item.company.id]?.count ?? 0;
    if (count < 1) continue;
    if (count > bestCount) {
      bestCount = count;
      bestId = item.company.id;
      tie = false;
    } else if (count === bestCount && count > 0) {
      tie = true;
    }
  }
  if (tie || bestCount < 1) return null;
  return bestId;
}

const FACT_ICON = 'mt-0.5 h-[18px] w-[18px] shrink-0 text-[#0f1a2e]';

function transferRow(type: ParkingProductType, meet: boolean): { Icon: LucideIcon; title: string } {
  if (type === 'shuttle') return { Icon: BusFront, title: '셔틀로 이동' };
  if (type === 'walk') return { Icon: Footprints, title: '터미널까지 도보' };
  return meet
    ? { Icon: PlaneTakeoff, title: valetHandoffTitle(true) }
    : { Icon: SquareParking, title: valetHandoffTitle(false) };
}

/** 손바닥 위 키 — lucide hand-coins 손 모양 + 키 */
function HandKeyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
      <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
      <path d="m2 16 6 6" />
      <circle cx="7" cy="5" r="3" />
      <path d="M10 5h10M17 5v2.5M20 5v3" />
    </svg>
  );
}

/** 상품 배지 하나 — 후기 많은 순 우선, 없으면 최저가. 지난번 마크와는 별개 */
function productBadge(
  companyId: string,
  lowestId: string | null,
  reviewedId: string | null
): string | null {
  if (reviewedId && companyId === reviewedId) return '후기 많은';
  if (lowestId && companyId === lowestId) return '최저가';
  return null;
}

function PriceList({
  items,
  stay,
  isIndoor,
  terminal,
  onDetail,
  onBook,
  marks = {},
  reviews = {},
}: {
  items: Array<PricedCompany & { listPrice: number }>;
  stay: string;
  isIndoor: boolean;
  terminal: Terminal;
  onDetail: (company: Company, price: number) => void;
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
  const reviewedId = mostReviewedId(items, reviews);
  const lotLabel = isIndoor ? PARKING_LABEL_INDOOR : PARKING_LABEL_OUTDOOR;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(({ company, price, listPrice, soldOut }) => {
        const badge = productBadge(company.id, lowestId, reviewedId);
        const snapshot = reviews[company.id];
        const rating =
          snapshot && snapshot.count > 0 && snapshot.averageRating != null && snapshot.averageRating > 0
            ? snapshot.averageRating
            : null;
        const thumb = companyThumbnailUrl(companyCardPhotoUrl(company, isIndoor), 128);
        const meetHandoff = companyIsFaceHandoff(company, { isIndoor, terminal });
        const pin = pickupPin(terminal, meetHandoff ? 'depart' : 'short');
        const product = findParkingProduct(company, { isIndoor, terminal }, meetHandoff);
        const facts = parkingProductFacts(product);
        const transfer = transferRow(product?.type ?? 'valet', meetHandoff);
        const keyLeave = product?.keyHandover !== 'keep';
        const keyText =
          facts.key ??
          (product?.type === 'valet' || !product
            ? meetHandoff
              ? '키를 맡깁니다'
              : '단기주차장에서 키를 맡깁니다'
            : null);
        const insuranceLabel =
          shouldShowInsuranceBadge(company) ? displayInsuranceLabel(company) : null;
        const handoffBadge = valetHandoffBadge(meetHandoff);
        return (
          <article
            key={company.id}
            className={cn(
              'flex w-full flex-col rounded-2xl bg-white px-4 py-4 text-left ring-1 ring-[#0f1a2e]/10',
              soldOut && 'opacity-40'
            )}
          >
            <div className="flex items-start gap-3">
              {thumb ? (
                <img
                  src={thumb}
                  alt=""
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] shrink-0 rounded-2xl object-cover ring-1 ring-[#0f1a2e]/10"
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-bold leading-snug text-[#0f1a2e]">
                  {displayCompanyName(company.name)}
                </p>
                {rating != null ? (
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-[#0f1a2e]/70">
                    <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden />
                    <span className="tabular-nums text-[#0f1a2e]">{formatCardRating(rating)}</span>
                    <span className="font-medium text-[#0f1a2e]/45">후기 {snapshot!.count}</span>
                  </p>
                ) : snapshot && snapshot.count === 0 ? (
                  <p className="mt-1 text-[13px] font-medium text-[#0f1a2e]/45">
                    신규 입점 · 후기 모으는 중
                  </p>
                ) : null}
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                      meetHandoff
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {handoffBadge}
                  </span>
                  {marks[company.id] ? (
                    <span className="rounded-full bg-[#F3E6C4] px-2 py-0.5 text-[11px] font-bold text-[#0f1a2e]">
                      {marks[company.id]}
                    </span>
                  ) : null}
                  {badge ? (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold">
                      {badge}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <ul className="mb-3 mt-3 space-y-2.5">
              <li className="flex gap-2.5">
                <transfer.Icon size={18} strokeWidth={2} className={FACT_ICON} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-[#0f1a2e]">{transfer.title}</span>
                  <span className="mt-0.5 block text-[12px] font-medium leading-snug text-[#0f1a2e]/55">
                    {facts.transfer ?? pin.detail}
                  </span>
                </span>
              </li>
              {keyText ? (
                <li className="flex gap-2.5">
                  {keyLeave ? (
                    <HandKeyIcon className={FACT_ICON} />
                  ) : (
                    <KeyRound size={18} strokeWidth={2} className={FACT_ICON} aria-hidden />
                  )}
                  <span className="text-[14px] font-semibold text-[#0f1a2e]">{keyText}</span>
                </li>
              ) : null}
              {facts.meetHours ? (
                <li className="flex gap-2.5">
                  <Clock size={18} strokeWidth={2} className={FACT_ICON} aria-hidden />
                  <span className="text-[14px] font-semibold text-[#0f1a2e]">{facts.meetHours}</span>
                </li>
              ) : null}
              {facts.ev ? (
                <li className="flex gap-2.5">
                  <EvCharger size={18} strokeWidth={2} className={FACT_ICON} aria-hidden />
                  <span className="text-[14px] font-semibold text-[#0f1a2e]">{facts.ev}</span>
                </li>
              ) : null}
              {insuranceLabel ? (
                <li className="flex gap-2.5">
                  <Shield size={18} strokeWidth={2} className={FACT_ICON} aria-hidden />
                  <span className="text-[14px] font-semibold text-[#0f1a2e]">{insuranceLabel}</span>
                </li>
              ) : null}
              <li className="flex gap-2.5">
                {isIndoor ? (
                  <Warehouse size={18} strokeWidth={2} className={FACT_ICON} aria-hidden />
                ) : (
                  <Sun size={18} strokeWidth={2} className={FACT_ICON} aria-hidden />
                )}
                <span className="text-[14px] font-semibold text-[#0f1a2e]">{lotLabel} 주차장 보관</span>
              </li>
              <li className="flex gap-2.5">
                <Wallet size={18} strokeWidth={2} className={FACT_ICON} aria-hidden />
                <span className="text-[14px] font-semibold text-[#0f1a2e]">현장 결제</span>
              </li>
            </ul>

            <div className="mt-auto border-t border-[#0f1a2e]/8 pt-3">
              {soldOut ? (
                <p className="text-[16px] font-bold text-[#0f1a2e]">마감</p>
              ) : (
                <>
                  <div className="mb-3 text-right">
                    {listPrice > price ? (
                      <p className="text-[13px] font-semibold text-[#0f1a2e]/45 line-through">
                        {listPrice.toLocaleString()}원
                      </p>
                    ) : null}
                    <p className="text-[20px] font-bold tabular-nums text-[#0f1a2e]">
                      {price.toLocaleString()}원
                    </p>
                    <p className="text-[12px] font-medium text-[#0f1a2e]/45">총 {stay} 기준</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onDetail(company, price)}
                      className="rounded-xl bg-[#f4f5f7] py-3 text-[14px] font-bold text-[#0f1a2e] ring-1 ring-[#0f1a2e]/10 transition active:scale-[0.99]"
                    >
                      자세히
                    </button>
                    <button
                      type="button"
                      onClick={() => onBook(company, price)}
                      className="rounded-xl bg-[#0f1a2e] py-3 text-[14px] font-bold text-white transition active:scale-[0.99]"
                    >
                      예약하기
                    </button>
                  </div>
                </>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
