import { useEffect, useMemo, useState } from 'react';
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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SupportPage from './pages/SupportPage';
import type { AppTab, BookingSearch, Company } from './types';
import { defaultBookingSearch } from './utils/dates';

export default function App() {
  const [tab, setTab] = useState<AppTab>('home');
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
  const [privacyOpen, setPrivacyOpen] = useState(false);

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

  const page = useMemo(() => {
    if (tab === 'home') {
      return (
        <HomePage
          companies={companies}
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
          {loading && tab === 'compare' ? (
            <p className="py-12 text-center text-sm font-semibold text-muted">
              제휴 업체 불러오는 중…
            </p>
          ) : (
            page
          )}
          <SiteFooter onOpenPrivacy={() => setPrivacyOpen(true)} />
        </main>
      </div>
      <BottomNav active={tab} onChange={setTab} />

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
          onClose={() => setBookingTarget(null)}
          onSuccess={(id) => {
            trackParkingBookComplete(bookingTarget.company.id, bookingTarget.company.name);
            setLastReservationId(id);
            setBookingTarget(null);
            setTab('my');
            alert(`예약이 접수되었습니다.\n예약번호: ${id}`);
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

      {privacyOpen && <PrivacyPolicyPage onBack={() => setPrivacyOpen(false)} />}
    </div>
  );
}
