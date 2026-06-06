import { useEffect, useMemo, useState } from 'react';
import BookingModal from './components/BookingModal';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import { subscribeCompanies } from './lib/companies';
import ComparePage from './pages/ComparePage';
import EsimPage from './pages/EsimPage';
import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage';
import type { AppTab, BookingSearch, Company } from './types';
import { defaultBookingSearch } from './utils/dates';

export default function App() {
  const [tab, setTab] = useState<AppTab>('home');
  const [search, setSearch] = useState<BookingSearch>(defaultBookingSearch);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingTarget, setBookingTarget] = useState<{ company: Company; price: number } | null>(
    null
  );
  const [lastReservationId, setLastReservationId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeCompanies((list) => {
      setCompanies(list.filter((c) => c.id !== 'airpick' && c.id !== 'air25'));
      setLoading(false);
    });
    return unsub;
  }, []);

  const page = useMemo(() => {
    if (tab === 'home') {
      return (
        <HomePage search={search} onBookNow={() => setTab('compare')} />
      );
    }
    if (tab === 'compare') {
      return (
        <ComparePage
          search={search}
          onSearchChange={setSearch}
          companies={companies}
          onSelectCompany={(company, price) => setBookingTarget({ company, price })}
        />
      );
    }
    if (tab === 'esim') return <EsimPage />;
    return <MyPage lastReservationId={lastReservationId} />;
  }, [tab, search, companies, lastReservationId]);

  return (
    <div className="min-h-dvh bg-sky-bg text-ink">
      <div className="mx-auto min-h-dvh max-w-lg bg-sky-bg pb-24">
        <Header />
        <main className="px-4 py-5">
          {loading && tab === 'compare' ? (
            <p className="py-12 text-center text-sm font-semibold text-muted">
              제휴 업체 불러오는 중…
            </p>
          ) : (
            page
          )}
        </main>
      </div>
      <BottomNav active={tab} onChange={setTab} />

      {bookingTarget && (
        <BookingModal
          company={bookingTarget.company}
          search={search}
          price={bookingTarget.price}
          onClose={() => setBookingTarget(null)}
          onSuccess={(id) => {
            setLastReservationId(id);
            setBookingTarget(null);
            setTab('my');
            alert(`예약이 접수되었습니다.\n예약번호: ${id}`);
          }}
        />
      )}
    </div>
  );
}
