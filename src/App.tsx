import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { ComparePageSkeleton } from './components/LoadingSkeletons';
import AppMenuSheet from './components/AppMenuSheet';
import BottomNav from './components/BottomNav';
import BrandIntroGate, {
  clearBrandIntroSeen,
  shouldForceBrandIntro,
} from './components/BrandIntroGate';
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
import type { AppTab, BookingSearch, Company, EsimSearch } from './types';
import {
  ESIM_COMPARE_DOCUMENT_TITLE,
  PARKING_COMPARE_DOCUMENT_TITLE,
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
import { defaultEsimSearch } from './utils/esimSearch';
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
  home: `인천공항 주차대행, 한눈에 비교하세요. · 에어픽`,
  compare: PARKING_COMPARE_DOCUMENT_TITLE,
  esim: ESIM_COMPARE_DOCUMENT_TITLE,
  my: '내 예약 · 에어픽',
};

function shouldShowBrandIntroOnLaunch(initialTab: AppTab): boolean {
  if (shouldForceBrandIntro()) {
    clearBrandIntroSeen();
    return true;
  }
  /** 직링크(/parking, /esim, /my)는 게이트 스킵 — 홈(/) 접속마다 인트로 */
  return initialTab === 'home';
}

export default function App() {
  const [tab, setTabState] = useState<AppTab>(() => readInitialTab());
  const [showBrandIntro, setShowBrandIntro] = useState(() =>
    shouldShowBrandIntroOnLaunch(readInitialTab())
  );
  const [search, setSearch] = useState<BookingSearch>(defaultBookingSearch);
  const [esimSearch, setEsimSearch] = useState<EsimSearch>(() => {
    const fromUrl = readEsimCountryCode();
    return fromUrl ? { ...defaultEsimSearch, countryCode: fromUrl } : defaultEsimSearch;
  });
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

  const dismissBrandIntro = () => {
    setShowBrandIntro(false);
    setTab('home', 'replace');
    trackCtaClick('brand_intro_enter', 'brand_intro');
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
    const partners = companies.filter((c) => isAirpickPartner(c));

    if (tab === 'home') {
      return (
        <HomePage
          onGoTab={(next) => setTab(next)}
          partnerCount={partners.length}
        />
      );
    }
    if (tab === 'compare') {
      return (
        <ComparePage
          search={search}
          onSearchChange={(next) => setSearch(next)}
          companies={companies}
          onBookOnAirpick={(company, price) => setPartnerDetail({ company, price })}
        />
      );
    }
    if (tab === 'esim') {
      return <EsimPage search={esimSearch} onSearchChange={setEsimSearch} />;
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
  }, [tab, search, esimSearch, companies, lastReservationId, reviewReservationId]);

  const pageFallback = tab === 'compare' ? <ComparePageSkeleton /> : null;

  if (showBrandIntro) {
    return <BrandIntroGate onEnter={dismissBrandIntro} />;
  }

  const homeTone = tab === 'home';

  return (
    <div className="min-h-dvh bg-white text-ink">
      <Header wide={homeTone} onOpenMenu={() => setMenuOpen(true)} />
      <main>
        {loading && tab === 'compare' ? (
          <ComparePageSkeleton />
        ) : homeTone ? (
          <Suspense fallback={pageFallback}>{page}</Suspense>
        ) : (
          <div className="mx-auto max-w-lg px-4 pt-1 pb-24">
            <Suspense fallback={pageFallback}>{page}</Suspense>
            <SiteFooter tone="default" />
          </div>
        )}
      </main>
      <BottomNav
        active={tab}
        tone="premium"
        wide={homeTone}
        onChange={(next) => setTab(next)}
      />

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
