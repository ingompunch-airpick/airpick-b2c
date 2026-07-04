import { BookOpen, Car, ChevronRight, HelpCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { BRAND_SUBLINE, BRAND_TAGLINE, PARKING_TAB_LABEL } from '../constants/marketing';
import ReservationCard from '../components/ReservationCard';
import ReservationLookupForm from '../components/ReservationLookupForm';
import { subscribeCompanies } from '../lib/companies';
import {
  cancelReservation,
  fetchReservationById,
  lookupReservations,
  subscribeReservation,
} from '../lib/reservations';
import type { Company, Reservation, ReservationLookupMode } from '../types';
import { clearRecentReservation, getRecentReservation } from '../utils/recentReservation';

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
  onOpenParkingGuide,
  onOpenEsimGuide,
}: {
  lastReservationId: string | null;
  onBookParking: () => void;
  onOpenSupport?: () => void;
  onOpenParkingGuide?: () => void;
  onOpenEsimGuide?: () => void;
}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [companiesById, setCompaniesById] = useState<Record<string, Company>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [recentCarNumber] = useState(() => getRecentReservation()?.carNumber ?? '');

  const handleCancel = async (reservation: Reservation, password: string) => {
    await cancelReservation(reservation.id, password);
    setReservations((prev) => prev.filter((r) => r.id !== reservation.id));
    if (getRecentReservation()?.id === reservation.id) clearRecentReservation();
  };

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

  const handleLookup = async (mode: ReservationLookupMode, value: string, password: string) => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const list = await lookupReservations(mode, value, password);
      setReservations(list);
    } catch (err) {
      console.error(err);
      setError('예약 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <section className="rounded-3xl bg-gradient-to-br from-sky-tint to-sky-soft p-5 shadow-[0_4px_16px_rgba(49,130,246,0.1)]">
        <p className="text-xs font-bold text-brand">예약 · 맡긴 차 확인</p>
        <h1 className="mt-1 text-xl font-bold leading-tight text-ink">{BRAND_TAGLINE}</h1>
        <p className="mt-2 text-sm font-medium text-muted">{BRAND_SUBLINE}</p>
      </section>

      <ReservationLookupForm
        onLookup={handleLookup}
        loading={loading}
        initialMode={recentCarNumber ? 'carNumber' : undefined}
        initialValue={recentCarNumber || undefined}
      />

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
              onBookAirpick={onBookParking}
              onCancel={(password) => handleCancel(reservation, password)}
            />
          ))}
        </div>
      ) : searched && !loading ? (
        <div className="rounded-2xl bg-sky-soft px-4 py-8 text-center shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
          <p className="text-sm font-bold text-ink">일치하는 예약이 없습니다</p>
          <p className="mt-1 text-xs font-medium text-muted">
            차량번호(또는 연락처)와 예약 비밀번호 4자리를 확인해 주세요
          </p>
          <button
            type="button"
            onClick={onBookParking}
            className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white"
          >
            {PARKING_TAB_LABEL} 탭에서 예약하기
          </button>
        </div>
      ) : !loading && !lastReservationId ? (
        <p className="rounded-2xl bg-sky-tint px-4 py-3 text-center text-sm text-muted">
          차량번호(또는 연락처)와 예약 비밀번호로 예약을 조회해 보세요
        </p>
      ) : null}

      <div className="space-y-2">
        <p className="px-1 text-[11px] font-bold text-muted">이용 가이드 · FAQ</p>
        <MyMenuButton
          label="주차대행 이용 가이드"
          icon={Car}
          onClick={() => onOpenParkingGuide?.()}
        />
        <MyMenuButton
          label="유심·eSIM 이용 가이드"
          icon={BookOpen}
          onClick={() => onOpenEsimGuide?.()}
        />
        {onOpenSupport && (
          <MyMenuButton label="자주 묻는 질문" icon={HelpCircle} onClick={onOpenSupport} />
        )}
      </div>
    </div>
  );
}
