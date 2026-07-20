import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { ComparePageSkeleton, HomePageSkeleton } from './components/LoadingSkeletons';
import AppMenuSheet from './components/AppMenuSheet';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import SiteFooter from './components/SiteFooter';
import { subscribeCompanies } from './lib/companies';
import {
  trackCtaClick,
  trackParkingBookComplete,
  trackParkingBookStart,
  trackTabView,
} from './lib/analytics';
import HomePage from './pages/HomePage';
import SpotsPage from './pages/SpotsPage';
import type { AppTab, BookingSearch, Company } from './types';
import {
  ESIM_COMPARE_DOCUMENT_TITLE,
  PARKING_COMPARE_DOCUMENT_TITLE,
  SPOTS_TAB_LABEL,
} from './constants/marketing';
import {
  clearParkingCompanyQuery,
  clearReviewQueryParam,
  isSeoDocumentPath,
  readEsimCountryCode,
  readInitialTab,
  readParkingCompanyId,
  readReviewReservationId,
  syncUrlToTab,
  tabFromPathname,
} from './utils/appPath';
import { defaultBookingSearch } from './utils/dates';
import { calculatePrice } from './utils/pricing';
import { isAirpickPartner } from './utils/compareSort';

const ComparePage = lazy(() => import('./pages/ComparePage'));
const EsimPage = lazy(() => import('./pages/EsimPage'));
const MyPage = lazy(() => import('./pages/MyPage'));
const CompanyDetailSheet = lazy(() => import('./components/CompanyDetailSheet'));
const BookingModal = lazy(() => import('./components/BookingModal'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const EsimGuidePage = lazy(() => import('./pages/EsimGuidePage'));
const ParkingGuidePage = lazy(() => import('./pages/ParkingGuidePage'));

const DOCUMENT_TITLE: Record<AppTab, string> = {
  home: `인천공항 출국시간 계산기 · 혼잡·대기 여유 · 에어픽`,
  compare: PARKING_COMPARE_DOCUMENT_TITLE,
  esim: ESIM_COMPARE_DOCUMENT_TITLE,
  spots: `${SPOTS_TAB_LABEL} · 에어픽`,
  my: '내 예약 · 에어픽',
};

export default function App() {
  const [tab, setTabState] = useState<AppTab>(() => readInitialTab());
  const [search, setSearch] = useState<BookingSearch>(defaultBookingSearch);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerDetail, setPartnerDetail] = useState<{ company: Company; price: number } | null>(
    null
  );
  const [bookingTarget, setBookingTarget] = useState<{ company: Company; price: number } | null>(
    null
  );
  const [lastReservationId, setLastReservationId] = useState<string | null>(null);
  const [reviewReservationId, setReviewReservationId] = useState<string | null>(() =>
    readReviewReservationId()
  );
  const [pendingCompanyId, setPendingCompanyId] = useState<string | null>(() =>
    readParkingCompanyId()
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [esimGuideOpen, setEsimGuideOpen] = useState(false);
  const [parkingGuideOpen, setParkingGuideOpen] = useState(false);

  const setTab = (next: AppTab, mode: 'push' | 'replace' = 'push') => {
    setTabState(next);
    syncUrlToTab(next, mode);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const unsub = subscribeCompanies((list) => {
      setCompanies(list.filter((c) => c.id !== 'airpick' && c.id !== 'air25'));
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    trackTabView(tab);
    document.title = DOCUMENT_TITLE[tab];
  }, [tab]);

  /** /parking?company= → 상세 시트 프리필 */
  useEffect(() => {
    if (tab !== 'compare' || loading || !pendingCompanyId) return;
    const company = companies.find((c) => c.id === pendingCompanyId && isAirpickPartner(c));
    if (!company) {
      clearParkingCompanyQuery();
      setPendingCompanyId(null);
      return;
    }
    const price = calculatePrice(
      company,
      search.departureDate,
      search.arrivalDate,
      search.isIndoor,
      search.terminal === 'T2',
      search.departureTime,
      search.arrivalTime,
      false
    );
    setPartnerDetail({ company, price });
    clearParkingCompanyQuery();
    setPendingCompanyId(null);
  }, [tab, loading, pendingCompanyId, companies, search]);

  useEffect(() => {
    const path = window.location.pathname;
    if (!isSeoDocumentPath(path) && tabFromPathname(path) == null) {
      syncUrlToTab('home', 'replace');
      setTabState('home');
    }

    const onPopState = () => {
      const current = window.location.pathname;
      if (isSeoDocumentPath(current)) {
        window.location.assign(current + window.location.search + window.location.hash);
        return;
      }
      const next = tabFromPathname(current) ?? 'home';
      setTabState(next);
      if (next === 'compare') setPendingCompanyId(readParkingCompanyId());
      if (tabFromPathname(current) == null) {
        syncUrlToTab('home', 'replace');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const page = useMemo(() => {
    if (tab === 'home') {
      return <HomePage onGoTab={(next) => setTab(next)} />;
    }
    if (tab === 'spots') {
      return <SpotsPage />;
    }
    if (tab === 'compare') {
      return (
        <ComparePage
          search={search}
          onSearchChange={setSearch}
          companies={companies}
          onBookOnAirpick={(company, price) => setPartnerDetail({ company, price })}
        />
      );
    }
    if (tab === 'esim') {
      return <EsimPage initialCountryCode={readEsimCountryCode() ?? undefined} />;
    }
    return (
      <MyPage
        lastReservationId={lastReservationId}
        reviewReservationId={reviewReservationId}
        onReviewDeepLinkHandled={() => {
          clearReviewQueryParam();
          setReviewReservationId(null);
        }}
        onBookParking={() => {
          trackCtaClick('compare_parking', 'reservation');
          setTab('compare');
        }}
        onOpenSupport={() => {
          trackCtaClick('open_faq', 'reservation');
          setSupportOpen(true);
        }}
        onOpenParkingGuide={() => {
          trackCtaClick('open_parking_guide', 'reservation');
          setParkingGuideOpen(true);
        }}
        onOpenEsimGuide={() => {
          trackCtaClick('open_esim_guide', 'reservation');
          setEsimGuideOpen(true);
        }}
      />
    );
  }, [tab, search, companies, lastReservationId, reviewReservationId]);

  const pageFallback =
    tab === 'compare' ? <ComparePageSkeleton /> : tab === 'spots' ? <HomePageSkeleton /> : null;

  const isMapSpots = tab === 'spots';

  return (
    <div className="min-h-dvh bg-sky-bg text-ink">
      <div
        className={
          isMapSpots
            ? 'mx-auto flex h-dvh max-w-lg flex-col overflow-hidden bg-sky-bg pb-[calc(3.5rem+env(safe-area-inset-bottom))]'
            : 'mx-auto min-h-dvh max-w-lg bg-sky-bg pb-24'
        }
      >
        <Header onOpenMenu={() => setMenuOpen(true)} />
        {isMapSpots ? (
          <main className="relative min-h-0 flex-1">
            <Suspense fallback={<HomePageSkeleton />}>{page}</Suspense>
          </main>
        ) : (
          <main className="px-4 pt-1 pb-5">
            {loading && tab === 'compare' ? (
              <ComparePageSkeleton />
            ) : (
              <Suspense fallback={pageFallback}>{page}</Suspense>
            )}
            <SiteFooter />
          </main>
        )}
      </div>
      <BottomNav active={tab} onChange={(next) => setTab(next)} />

      <Suspense fallback={null}>
        {partnerDetail && (
          <CompanyDetailSheet
            company={partnerDetail.company}
            price={partnerDetail.price}
            search={search}
            onClose={() => setPartnerDetail(null)}
            onBook={() => {
              trackParkingBookStart(partnerDetail.company.id, partnerDetail.company.name);
              setBookingTarget(partnerDetail);
              setPartnerDetail(null);
            }}
          />
        )}

        {bookingTarget && (
          <BookingModal
            company={bookingTarget.company}
            search={search}
            price={bookingTarget.price}
            onClose={() => {
              setBookingTarget(null);
              setPartnerDetail(null);
            }}
            onSuccess={(id) => {
              trackParkingBookComplete(bookingTarget.company.id, bookingTarget.company.name);
              setLastReservationId(id);
              setBookingTarget(null);
              setPartnerDetail(null);
              setTab('my');
            }}
          />
        )}

        {menuOpen && (
          <AppMenuSheet
            onClose={() => setMenuOpen(false)}
            onOpenSupport={() => {
              trackCtaClick('open_faq', 'menu');
              setSupportOpen(true);
            }}
          />
        )}

        {supportOpen && <SupportPage onBack={() => setSupportOpen(false)} />}

        {esimGuideOpen && <EsimGuidePage onBack={() => setEsimGuideOpen(false)} />}

        {parkingGuideOpen && <ParkingGuidePage onBack={() => setParkingGuideOpen(false)} />}
      </Suspense>
    </div>
  );
}
