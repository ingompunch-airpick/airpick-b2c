import { BookOpen, ChevronRight, HelpCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { BRAND_SUBLINE, BRAND_TAGLINE } from '../constants/marketing';
import { openPartnerInquiryEmail } from '../constants/partnerContact';
import ReservationCard from '../components/ReservationCard';
import ReservationLookupForm from '../components/ReservationLookupForm';
import { subscribeCompanies } from '../lib/companies';
import { fetchReservationById, lookupReservations, subscribeReservation } from '../lib/reservations';
import type { Company, Reservation, ReservationLookupMode } from '../types';

function MyMenuButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof HelpCircle;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl bg-sky-soft px-4 py-3.5 text-left ring-1 ring-sky-border/60 transition-colors hover:bg-sky-tint"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon size={18} className="shrink-0 text-brand" strokeWidth={2} />
        <span className="text-sm font-bold text-ink">{label}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted-light" />
    </button>
  );
}

export default function MyPage({
  lastReservationId,
  onBookParking,
  onOpenSupport,
}: {
  lastReservationId: string | null;
  onBookParking: () => void;
  onOpenSupport?: () => void;
}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [companiesById, setCompaniesById] = useState<Record<string, Company>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const loadLastReservation = useCallback(async () => {
    if (!lastReservationId) return;
    const recent = await fetchReservationById(lastReservationId);
    if (recent) {
      setReservations((prev) => {
        if (prev.some((r) => r.id === recent.id)) return prev;
        return [recent, ...prev.filter((r) => r.id !== recent.id)];
      });
    }
  }, [lastReservationId]);

  useEffect(() => {
    const unsub = subscribeCompanies((list) => {
      setCompaniesById(Object.fromEntries(list.map((c) => [c.id, c])));
    });
    return unsub;
  }, []);

  const companyMap = companiesById;

  useEffect(() => {
    void loadLastReservation();
  }, [loadLastReservation]);

  useEffect(() => {
    const ids = reservations.map((r) => r.id).filter(Boolean) as string[];
    if (ids.length === 0) return;

    const unsubs = ids.map((id) =>
      subscribeReservation(id, (updated) => {
        if (!updated) return;
        setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      })
    );

    return () => unsubs.forEach((unsub) => unsub());
  }, [reservations.map((r) => r.id).join('|')]);

  const handleLookup = async (mode: ReservationLookupMode, value: string) => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const list = await lookupReservations(mode, value);
      setReservations(list);
    } catch (err) {
      console.error(err);
      setError('예약 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const showComingSoon = (title: string) => {
    window.alert(`${title}\n\n준비 중입니다.`);
  };

  return (
    <div className="space-y-4 pb-8">
      <section className="rounded-3xl bg-gradient-to-br from-sky-tint to-sky-soft p-5 shadow-[0_4px_16px_rgba(49,130,246,0.1)]">
        <p className="text-xs font-bold text-brand">MY · 내 예약</p>
        <h1 className="mt-1 text-xl font-bold leading-tight text-ink">{BRAND_TAGLINE}</h1>
        <p className="mt-2 text-sm font-medium text-muted">{BRAND_SUBLINE}</p>
      </section>

      <ReservationLookupForm onLookup={handleLookup} loading={loading} />

      <div className="space-y-2">
        {onOpenSupport && (
          <MyMenuButton label="자주 묻는 질문" icon={HelpCircle} onClick={onOpenSupport} />
        )}
        <MyMenuButton
          label="초보자를 위한 유심/eSIM 이용 가이드"
          icon={BookOpen}
          onClick={() => showComingSoon('초보자를 위한 유심/eSIM 이용 가이드')}
        />
        <MyMenuButton
          label="유심 관련 자주 묻는 질문(FAQ)"
          icon={HelpCircle}
          onClick={() => showComingSoon('유심 관련 자주 묻는 질문')}
        />
      </div>

      {lastReservationId && !searched && reservations.length > 0 && (
        <p className="px-1 text-xs font-semibold text-brand">
          방금 접수한 예약을 먼저 보여드립니다
        </p>
      )}

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600 ring-1 ring-rose-100">
          {error}
        </p>
      )}

      {reservations.length > 0 ? (
        <div className="space-y-3">
          <p className="px-1 text-xs font-bold text-muted">
            예약 {reservations.length}건 · 위치 · 사진 · 보험
          </p>
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              company={companyMap[reservation.companyId]}
            />
          ))}
        </div>
      ) : searched && !loading ? (
        <div className="rounded-2xl bg-sky-soft px-4 py-8 text-center shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
          <p className="text-sm font-bold text-ink">일치하는 예약이 없습니다</p>
          <p className="mt-1 text-xs font-medium text-muted">
            예약 시 입력한 차량번호 또는 연락처를 확인해 주세요
          </p>
          <button
            type="button"
            onClick={onBookParking}
            className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white"
          >
            주차 탭에서 예약하기
          </button>
        </div>
      ) : !loading && !lastReservationId ? (
        <p className="rounded-2xl bg-sky-tint px-4 py-3 text-center text-sm text-muted">
          차량번호 또는 연락처로 예약을 조회해 보세요
        </p>
      ) : null}

      <section className="rounded-3xl bg-sky-soft p-5 shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
        <h2 className="text-sm font-bold text-ink">유심·eSIM</h2>
        <p className="mt-1 text-xs font-medium text-muted">
          제휴사 요금 비교 후 해당 사이트에서 구매합니다. 주차 예약과 별도이며, 주문·개통
          내역은 제휴사에서 확인해 주세요.
        </p>
        <p className="mt-3 rounded-2xl bg-sky-tint px-4 py-3 text-sm text-muted">
          유심 탭에서 제휴 요금을 비교할 수 있습니다.
        </p>
      </section>

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={openPartnerInquiryEmail}
          className="text-[11px] font-medium text-muted-light underline-offset-2 hover:text-muted hover:underline"
        >
          ✉️ 비즈니스 / 입점 제휴 문의
        </button>
      </div>
    </div>
  );
}
