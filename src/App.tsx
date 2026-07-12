import { useEffect, useMemo, useState } from 'react';
import { ComparePageSkeleton, HomePageSkeleton } from './components/LoadingSkeletons';
import AppMenuSheet from './components/AppMenuSheet';
import BookingModal from './components/BookingModal';
import BottomNav from './components/BottomNav';
import CompanyDetailSheet from './components/CompanyDetailSheet';
import Header from './components/Header';
import SiteFooter from './components/SiteFooter';
import { subscribeCompanies } from './lib/companies';
import {
  trackCtaClick,
  trackParkingBookComplete,
  trackParkingBookStart,
  trackTabView,
} from './lib/analytics';
import ComparePage from './pages/ComparePage';
import EsimPage from './pages/EsimPage';
import EsimGuidePage from './pages/EsimGuidePage';
import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage';
import ParkingGuidePage from './pages/ParkingGuidePage';
import SupportPage from './pages/SupportPage';
import type { AppTab, BookingSearch, Company } from './types';
import { readInitialTab, syncUrlToTab, tabFromPathname } from './utils/appPath';
import { defaultBookingSearch } from './utils/dates';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [esimGuideOpen, setEsimGuideOpen] = useState(false);
  const [parkingGuideOpen, setParkingGuideOpen] = useState(false);

  const setTab = (next: AppTab, mode: 'push' | 'replace' = 'push') => {
    setTabState(next);
    syncUrlToTab(next, mode);
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
  }, [tab]);

  useEffect(() => {
    // 알 수 없는 path로 들어오면 홈으로 정리
    if (tabFromPathname(window.location.pathname) == null) {
      syncUrlToTab('home', 'replace');
      setTabState('home');
    }

    const onPopState = () => {
      const next = tabFromPathname(window.location.pathname) ?? 'home';
      setTabState(next);
      if (tabFromPathname(window.location.pathname) == null) {
        syncUrlToTab('home', 'replace');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const page = useMemo(() => {
    if (tab === 'home') {
      return (
        <HomePage
          onCompareParking={() => {
            trackCtaClick('compare_parking', 'home');
            setTab('compare');
          }}
          onCompareEsim={() => {
            trackCtaClick('compare_esim', 'home');
            setTab('esim');
          }}
        />
      );
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
    if (tab === 'esim') return <EsimPage />;
    return (
      <MyPage
        lastReservationId={lastReservationId}
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
  }, [tab, search, companies, lastReservationId]);

  return (
    <div className="min-h-dvh bg-sky-bg text-ink">
      <div className="mx-auto min-h-dvh max-w-lg bg-sky-bg pb-24">
        <Header onOpenMenu={() => setMenuOpen(true)} />
        <main className="px-4 pt-1 pb-5">
          {loading && tab === 'home' ? (
            <HomePageSkeleton />
          ) : loading && tab === 'compare' ? (
            <ComparePageSkeleton />
          ) : (
            page
          )}
          <SiteFooter />
        </main>
      </div>
      <BottomNav active={tab} onChange={(next) => setTab(next)} />

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
    </div>
  );
}
