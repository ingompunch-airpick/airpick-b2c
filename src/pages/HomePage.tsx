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
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import DateField from '../components/DateField';
import HomeFaq from '../components/home/HomeFaq';
import HomeBrandHero from '../components/home/HomeBrandHero';
import HomePromiseStrip from '../components/home/HomePromiseStrip';
import HomeHowItWorks from '../components/home/HomeHowItWorks';
import { PRICE_INCLUSION } from '../constants/marketing';
import SiteNoticeBanner from '../components/SiteNoticeBanner';
import HomeYoutubeLive from '../components/home/HomeYoutubeLive';
import TimeField from '../components/TimeField';
import { checkBookingTimes } from '../utils/bookingWindow';
import { pickupPin } from '../data/pickupPins';
import { readMember, subscribeMember } from '../lib/memberSession';
import { listParkingCompareCompanies } from '../lib/parkingCompare';
import type { BookingSearch, Company, ParkingProductType, Reservation, Terminal } from '../types';
import { cn } from '../utils/cn';
import {
  buildPartnerPriceList,
  comparePartnerRelativeOrder,
  type PricedCompany,
} from '../utils/compareSort';
import { formatStayPhrase, todayYmd } from '../utils/dates';
import { maxArrivalYmd, maxDepartureYmd } from '../utils/bookingWindow';
import { displayCompanyName } from '../utils/display';
import { companyThumbnailUrl } from '../utils/imageUrl';
import { companyCardPhotoUrl } from '../utils/parkingLocation';
import { PARKING_LABEL_INDOOR, PARKING_LABEL_OUTDOOR } from '../utils/parkingType';
import { displayInsuranceLabel, getStatusLabel } from '../utils/trust';
import { shouldShowInsuranceBadge } from '../utils/trustDisplay';
import { displayCoverageLimitText } from '../utils/insurance';
import {
  findParkingProduct,
  formatOperatingHandoffLine,
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
import AirportSavingsLine from '../components/AirportSavingsLine';

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
    () => priceCompanies(companies, search, affiliateDiscountWon),
    [affiliateDiscountWon, companies, search]
  );

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
    <div className="bg-[#f4f6f8] pb-12">
      <section className="relative">
        {/* SEO: index.html 프리렌더와 같은 H1 — 앱이 뜬 뒤에도 페이지 제목 유지 */}
        <h1 className="sr-only">인천공항 주차대행, 보험 확인된 업체만 비교하세요</h1>
        <HomeBrandHero searchTargetId="home-search" />

        <div
          className="relative z-10 mx-auto -mt-14 max-w-lg px-4 md:max-w-3xl lg:max-w-5xl"
        >
          {/* 약속(안심케어)을 먼저 보여 주고 바로 아래 검색 카드 (대표 결정 11-24) */}
          <HomePromiseStrip />
          <div
            id="home-search"
            className="mt-4 scroll-mt-[calc(var(--app-header-h,60px)+0.75rem)] space-y-4 rounded-[28px] bg-white p-4 shadow-[0_12px_40px_rgba(15,26,46,0.08)] ring-1 ring-[#0f1a2e]/6 md:p-5"
          >
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
                <div className="flex items-start justify-between gap-2">
                  <ChoiceLabel>날짜</ChoiceLabel>
                  {/* 총 주차일수 — 날짜 잘못 고르는 실수 방지 */}
                  <span className="mb-2 rounded-full bg-[#0f1a2e] px-2.5 py-0.5 text-[12px] font-bold tabular-nums text-white">
                    {formatStayPhrase(getParkingDayCount(search.departureDate, search.arrivalDate))}
                  </span>
                </div>
                <div className="space-y-2">
                  <DateField
                    tone="premium"
                    size="large"
                    label="맡기는 날"
                    value={search.departureDate}
                    min={today}
                    max={maxDepartureYmd(today)}
                    onChange={(departureDate) => {
                      const next = { ...search, departureDate };
                      const arrMax = maxArrivalYmd(departureDate);
                      if (next.arrivalDate < departureDate) next.arrivalDate = departureDate;
                      else if (next.arrivalDate > arrMax) next.arrivalDate = arrMax;
                      onSearchChange(next);
                    }}
                  />
                  <DateField
                    tone="premium"
                    size="large"
                    label="찾는 날"
                    value={search.arrivalDate}
                    min={search.departureDate}
                    max={maxArrivalYmd(search.departureDate)}
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
                {(() => {
                  const tc = checkBookingTimes(search);
                  return tc.ok ? null : (
                    <p role="alert" className="mt-1.5 text-[12px] font-semibold text-rose-600">{tc.message}</p>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-lg scroll-mt-[calc(var(--app-header-h,60px)+0.75rem)] px-4 md:max-w-3xl lg:max-w-5xl">
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
                    isIndoor={search.isIndoor}
                    terminal={search.terminal}
                    stayDays={getParkingDayCount(search.departureDate, search.arrivalDate)}
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
                      isIndoor={search.isIndoor}
                      terminal={search.terminal}
                      stayDays={getParkingDayCount(search.departureDate, search.arrivalDate)}
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
                isIndoor={search.isIndoor}
                terminal={search.terminal}
                stayDays={getParkingDayCount(search.departureDate, search.arrivalDate)}
                onDetail={(company, price) => selectCompany(company, price, 'detail')}
                onBook={(company, price) => selectCompany(company, price, 'book')}
              />
            )}
          </>
        )}
      </section>
      <div className="mx-auto mt-12 max-w-lg px-4 md:max-w-3xl lg:max-w-5xl">
        <HomeHowItWorks />
      </div>
      <div className="mx-auto mt-10 max-w-lg px-4 md:max-w-3xl lg:max-w-5xl">
        <HomeYoutubeLive />
      </div>
      <div className="mx-auto mt-10 max-w-lg px-4 md:max-w-3xl lg:max-w-5xl">
        <HomeFaq />
      </div>
      {/* 홈 사업자·약관 푸터는 index.html #pg-legal-footer (React 밖) — PG 봇용 */}
    </div>
  );
}

function priceCompanies(
  companies: Company[],
  search: BookingSearch,
  affiliateDiscountWon: number
) {
  const partners = listParkingCompareCompanies(companies).filter((company) => {
    // 실내·야외 모두 업체가 등록한 상품(대면·비대면) 그대로 보여 준다 — 업체마다 운영 방식이 다르다
    const face = companyIsFaceHandoff(company, search);
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
      price: item.price,
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
  const partnerOrder = comparePartnerRelativeOrder(a.company.id, b.company.id);
  if (partnerOrder !== 0) return partnerOrder;
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

const FACT_ICON = 'mt-0.5 h-5 w-5 shrink-0 text-[#0f1a2e]';

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
  isIndoor,
  terminal,
  stayDays,
  onDetail,
  onBook,
  marks = {},
  reviews = {},
}: {
  items: Array<PricedCompany & { listPrice: number }>;
  isIndoor: boolean;
  terminal: Terminal;
  stayDays: number;
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
    <div className="grid items-stretch gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map(({ company, price, listPrice, soldOut }) => {
        const badge = productBadge(company.id, lowestId, reviewedId);
        const snapshot = reviews[company.id];
        const rating =
          snapshot && snapshot.count > 0 && snapshot.averageRating != null && snapshot.averageRating > 0
            ? snapshot.averageRating
            : null;
        const thumb = companyThumbnailUrl(companyCardPhotoUrl(company, isIndoor), 640);
        const meetHandoff = companyIsFaceHandoff(company, { isIndoor, terminal });
        const pin = pickupPin(terminal, meetHandoff ? 'depart' : 'short');
        const product = findParkingProduct(company, { isIndoor, terminal }, meetHandoff);
        const facts = parkingProductFacts(product);
        const operatingHandoff = formatOperatingHandoffLine(facts);
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
        const coverageLimitText = displayCoverageLimitText(company);
        const handoffBadge = valetHandoffBadge(meetHandoff);
        const stayLabel = formatStayPhrase(stayDays);
        return (
          <article
            key={company.id}
            className={cn(
              'relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left ring-1 ring-[#0f1a2e]/10',
              soldOut && 'opacity-40'
            )}
          >
            <div className="relative h-28 w-full shrink-0 bg-[#0f1a2e] sm:h-36">
              {thumb ? (
                <img
                  src={thumb}
                  alt={`${displayCompanyName(company.name)} 주차장`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-white/75"
                  aria-hidden
                >
                  <SquareParking size={28} strokeWidth={1.75} />
                  <span className="text-[12px] font-semibold tracking-wide">사진 준비 중</span>
                </div>
              )}
            </div>
            <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[18px] font-bold leading-snug text-[#0f1a2e]">
                    {displayCompanyName(company.name)}
                  </p>
                  {rating != null ? (
                    <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[14px] font-semibold text-[#0f1a2e]/70">
                      <Star size={15} className="fill-amber-400 text-amber-400" aria-hidden />
                      <span className="tabular-nums text-[#0f1a2e]">{formatCardRating(rating)}</span>
                      <span className="font-medium text-[#0f1a2e]/45">후기 {snapshot!.count}</span>
                    </p>
                  ) : snapshot && snapshot.count === 0 ? (
                    <p className="mt-1.5 text-[14px] font-medium text-[#0f1a2e]/45">신규 입점</p>
                  ) : null}
                </div>
                <div className="relative z-20 flex shrink-0 items-center gap-1.5 pt-0.5">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[12px] font-bold shadow-sm',
                      meetHandoff
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {handoffBadge}
                  </span>
                  {marks[company.id] ? (
                    <span className="rounded-full bg-[#F3E6C4] px-2.5 py-0.5 text-[12px] font-bold text-[#0f1a2e] shadow-sm">
                      {marks[company.id]}
                    </span>
                  ) : null}
                  {badge ? (
                    <span className="rounded-full bg-[#F3E6C4] px-2.5 py-0.5 text-[12px] font-bold text-[#0f1a2e] shadow-sm">
                      {badge}
                    </span>
                  ) : null}
                </div>
              </div>

              <ul className="mb-3 mt-3.5 space-y-2.5">
                <li className="flex gap-2.5">
                  <transfer.Icon size={20} strokeWidth={2} className={FACT_ICON} aria-hidden />
                  <span className="min-w-0 text-[15px] font-semibold leading-snug text-[#0f1a2e]">
                    {transfer.title}
                    {facts.transfer || pin.detail ? (
                      <span className="font-medium text-[#0f1a2e]/55">
                        {' '}
                        · {facts.transfer ?? pin.detail}
                      </span>
                    ) : null}
                  </span>
                </li>
                {keyText ? (
                  <li className="flex gap-2.5">
                    {keyLeave ? (
                      <HandKeyIcon className={FACT_ICON} />
                    ) : (
                      <KeyRound size={20} strokeWidth={2} className={FACT_ICON} aria-hidden />
                    )}
                    <span className="text-[15px] font-semibold text-[#0f1a2e]">{keyText}</span>
                  </li>
                ) : null}
                {coverageLimitText || insuranceLabel ? (
                  <li className="flex gap-2.5">
                    <Shield size={20} strokeWidth={2} className={FACT_ICON} aria-hidden />
                    <span className="min-w-0 text-[15px] font-semibold leading-snug text-[#0f1a2e]">
                      {coverageLimitText || insuranceLabel}
                      {coverageLimitText && insuranceLabel ? (
                        <span className="font-medium text-[#0f1a2e]/55"> · {insuranceLabel}</span>
                      ) : null}
                    </span>
                  </li>
                ) : null}
                {operatingHandoff ? (
                  <li className="flex gap-2.5">
                    <Clock size={20} strokeWidth={2} className={FACT_ICON} aria-hidden />
                    <span className="text-[15px] font-semibold text-[#0f1a2e]">{operatingHandoff}</span>
                  </li>
                ) : null}
                {facts.ev ? (
                  <li className="flex gap-2.5">
                    <EvCharger size={20} strokeWidth={2} className={FACT_ICON} aria-hidden />
                    <span className="text-[15px] font-semibold text-[#0f1a2e]">{facts.ev}</span>
                  </li>
                ) : null}
                <li className="flex gap-2.5">
                  {isIndoor ? (
                    <Warehouse size={20} strokeWidth={2} className={FACT_ICON} aria-hidden />
                  ) : (
                    <Sun size={20} strokeWidth={2} className={FACT_ICON} aria-hidden />
                  )}
                  <span className="text-[15px] font-semibold text-[#0f1a2e]">{lotLabel} 주차장 보관</span>
                </li>
              </ul>

              <div className="mt-auto border-t border-[#0f1a2e]/8 pt-3">
                {soldOut ? (
                  <p className="text-[17px] font-bold text-[#0f1a2e]">마감</p>
                ) : (
                  <>
                    <div className="mb-3 text-left">
                      {listPrice > price ? (
                        <p className="text-[14px] font-semibold text-[#0f1a2e]/45 line-through">
                          {listPrice.toLocaleString()}원
                        </p>
                      ) : null}
                      <p className="text-[22px] font-bold tabular-nums text-[#0f1a2e]">
                        {price.toLocaleString()}원
                      </p>
                      <p className="mt-0.5 text-[13px] font-semibold text-[#0f1a2e]/55">
                        {stayLabel} · 총액 ({PRICE_INCLUSION.cardSuffix})
                      </p>
                      <AirportSavingsLine
                        days={stayDays}
                        displayPriceWon={price}
                        className="mt-1"
                      />
                    </div>
                    <div className="relative z-20 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onDetail(company, price)}
                        className="rounded-xl bg-[#f4f5f7] py-3 text-[15px] font-bold text-[#0f1a2e] ring-1 ring-[#0f1a2e]/10 transition active:scale-[0.99]"
                      >
                        자세히
                      </button>
                      <button
                        type="button"
                        onClick={() => onBook(company, price)}
                        className="rounded-xl bg-[#0f1a2e] py-3 text-[15px] font-bold text-white transition active:scale-[0.99]"
                      >
                        예약하기
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
