import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { LayoutGrid, MapPinned, Plane, Smartphone } from 'lucide-react';
import {
  fetchIcnFlight,
  inputValueToYmd,
  todaySeoulYmd,
  ymdToInputValue,
  type IcnFlightResponse,
} from '../../lib/icnFlight';
import {
  formatRecentGuideLabel,
  loadRecentDepartureGuides,
  saveRecentDepartureGuide,
  type RecentDepartureGuide,
} from '../../lib/recentDepartureGuides';
import {
  buildDepartureGuide,
  formatStepMinutes,
  formatTotalMinutes,
  normalizeTransportMode,
  type CarParkingType,
  type TransportMode,
} from '../../utils/departureGuide';
import { ESIM_TAB_LABEL, PARKING_TAB_LABEL, SPOTS_TAB_LABEL } from '../../constants/marketing';
import DepartureGuideMap from './DepartureGuideMap';

const MODES: { id: TransportMode; label: string }[] = [
  { id: 'car', label: '자가용' },
  { id: 'limousine', label: '리무진' },
  { id: 'subway', label: '지하철' },
];

const PARKING: { id: CarParkingType; label: string }[] = [
  { id: 'long', label: '장기' },
  { id: 'short', label: '단기' },
  { id: 'valet', label: '주차대행' },
];

function normalizeFlightInput(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export default function DepartureGuideCard() {
  const [flightId, setFlightId] = useState('');
  const [date, setDate] = useState(() => ymdToInputValue(todaySeoulYmd()));
  const [mode, setMode] = useState<TransportMode>('car');
  const [parking, setParking] = useState<CarParkingType>('long');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flight, setFlight] = useState<IcnFlightResponse | null>(null);
  const [recent, setRecent] = useState<RecentDepartureGuide[]>([]);

  const refreshRecent = useCallback(() => {
    setRecent(loadRecentDepartureGuides());
  }, []);

  useEffect(() => {
    refreshRecent();
  }, [refreshRecent]);

  const runLookup = async (
    idRaw: string,
    dateYmd: string,
    nextMode: TransportMode,
    nextParking: CarParkingType
  ) => {
    const id = normalizeFlightInput(idRaw);
    if (!id) {
      setError('항공편명을 입력해 주세요. 예: KE101');
      return;
    }
    setFlightId(id);
    setMode(nextMode);
    setParking(nextParking);
    setLoading(true);
    setError(null);
    setFlight(null);
    const res = await fetchIcnFlight(id, dateYmd || todaySeoulYmd());
    setLoading(false);
    if (!res.ok) {
      setError(
        res.data?.message ||
          (res.status === 404
            ? '해당 날짜에 출발편이 없습니다.'
            : '운항 정보를 불러오지 못했습니다. 편명·날짜·API 신청을 확인해 주세요.')
      );
      return;
    }
    setFlight(res.data);
    saveRecentDepartureGuide({
      flightId: res.data.flightId,
      date: res.data.date,
      mode: nextMode,
      parking: nextMode === 'car' ? nextParking : undefined,
      airline: res.data.airline,
      terminal: res.data.terminal,
      checkInCounter: res.data.checkInCounter,
    });
    refreshRecent();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await runLookup(flightId, inputValueToYmd(date) || todaySeoulYmd(), mode, parking);
  };

  const restoreRecent = (g: RecentDepartureGuide) => {
    const nextMode = normalizeTransportMode(g.mode);
    const nextParking = nextMode === 'car' ? (g.parking ?? 'long') : parking;
    setFlightId(g.flightId);
    setDate(ymdToInputValue(g.date));
    setMode(nextMode);
    if (nextMode === 'car') setParking(nextParking);
    void runLookup(g.flightId, g.date, nextMode, nextParking);
  };

  const guide = flight
    ? buildDepartureGuide(
        flight.terminal
          ? flight
          : { ...flight, terminal: 'T1', terminalLabel: '제1여객터미널' },
        mode,
        mode === 'car' ? parking : undefined
      )
    : null;
  const totalLabel = guide
    ? formatTotalMinutes(guide.totalMinutesMin, guide.totalMinutesMax)
    : null;

  const contextCta =
    flight == null
      ? null
      : mode === 'car' && parking === 'valet'
        ? {
            href: '/parking',
            label: `${PARKING_TAB_LABEL} 업체 비교하기`,
            desc: '입점 업체 요금·예약',
            icon: LayoutGrid,
          }
        : mode === 'car'
          ? {
              href: '/spots',
              label: `${SPOTS_TAB_LABEL}에서 주차장 보기`,
              desc: '공식 주차장·지도',
              icon: MapPinned,
            }
          : {
              href: '/esim',
              label: `${ESIM_TAB_LABEL} 요금 비교`,
              desc: '여행용 데이터',
              icon: Smartphone,
            };

  return (
    <section className="rounded-2xl bg-white px-4 py-3.5 ring-1 ring-sky-border">
      <div className="flex items-center gap-2">
        <Plane size={16} className="text-brand" aria-hidden />
        <h2 className="text-sm font-bold text-ink">출국 동선</h2>
      </div>
      <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted">
        편명만 입력하면 체크인 카운터까지 한 번에 안내합니다. 예약 없이도 다시 조회할 수 있어요.
      </p>

      {recent.length > 0 ? (
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-bold text-muted">최근 조회</p>
          <div className="flex flex-wrap gap-1.5">
            {recent.slice(0, 4).map((g) => (
              <button
                key={`${g.flightId}-${g.date}-${g.mode}-${g.savedAt}`}
                type="button"
                onClick={() => restoreRecent(g)}
                className="rounded-full bg-sky-soft/80 px-2.5 py-1 text-[11px] font-bold text-ink ring-1 ring-sky-border/60"
              >
                {formatRecentGuideLabel(g)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="mt-3 space-y-2.5">
        <div className="grid grid-cols-[1.2fr_1fr] gap-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold text-muted">항공편명</span>
            <input
              value={flightId}
              onChange={(e) => setFlightId(normalizeFlightInput(e.target.value))}
              placeholder="KE101"
              autoCapitalize="characters"
              spellCheck={false}
              className="w-full rounded-xl bg-sky-soft/80 px-3 py-2 text-sm font-bold uppercase text-ink outline-none ring-1 ring-sky-border/60 placeholder:font-medium placeholder:normal-case placeholder:text-muted focus:ring-brand/40"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold text-muted">출발일</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl bg-sky-soft/80 px-3 py-2 text-sm font-semibold text-ink outline-none ring-1 ring-sky-border/60 focus:ring-brand/40"
            />
          </label>
        </div>

        <div>
          <p className="mb-1 text-[10px] font-bold text-muted">교통편</p>
          <div className="flex flex-wrap gap-1.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                  mode === m.id
                    ? 'bg-brand text-white'
                    : 'bg-sky-soft/80 text-ink ring-1 ring-sky-border/60'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'car' ? (
          <div>
            <p className="mb-1 text-[10px] font-bold text-muted">주차</p>
            <div className="flex flex-wrap gap-1.5">
              {PARKING.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setParking(p.id)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                    parking === p.id
                      ? 'bg-brand text-white'
                      : 'bg-sky-soft/80 text-ink ring-1 ring-sky-border/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {loading ? '조회 중…' : '동선 안내 보기'}
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-[11px] font-medium leading-relaxed text-amber-700">{error}</p>
      ) : null}

      {flight ? (
        <div className="mt-3 border-t border-sky-border/60 pt-3">
          <p className="text-xs font-bold text-ink">
            {flight.flightId}
            {flight.airline ? ` · ${flight.airline}` : ''}
            {flight.terminalLabel ? ` · ${flight.terminalLabel}` : ''}
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-muted">
            {flight.destination ? `${flight.destination}행` : ''}
            {flight.scheduleTime ? ` · 예정 ${flight.scheduleTime}` : ''}
            {flight.checkInCounter ? ` · 체크인 ${flight.checkInCounter}` : ' · 체크인 미정'}
            {flight.remark ? ` · ${flight.remark}` : ''}
          </p>
          {totalLabel && guide ? (
            <div className="mt-3 rounded-xl bg-sky-soft/80 px-3 py-2.5 ring-1 ring-sky-border/60">
              <p className="text-[12px] font-bold text-ink">
                공항 안 이동 합계 <span className="text-brand">{totalLabel}</span>
              </p>
              <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-muted">
                {guide.totalNote}
              </p>
            </div>
          ) : null}
          {mode === 'car' && (flight.terminal === 'T1' || flight.terminal === 'T2') ? (
            <div className="mt-3">
              <p className="mb-1.5 text-[10px] font-bold text-muted">지도 (위치 참고)</p>
              <DepartureGuideMap terminal={flight.terminal} parking={parking} />
            </div>
          ) : null}
          {guide && guide.steps.length > 0 ? (
            <ol className="mt-3 list-none space-y-2">
              {guide.steps.map((step, i) => {
                const mins = formatStepMinutes(step);
                return (
                  <li
                    key={i}
                    className="flex gap-2.5 text-[12px] font-semibold leading-relaxed text-ink"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      {step.text}
                      {mins ? (
                        <span className="mt-0.5 block text-[10px] font-bold text-brand">
                          {mins}
                        </span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : null}
          {!flight.checkInCounter ? (
            <p className="mt-2 text-[10px] font-medium leading-relaxed text-muted">
              체크인 카운터가 아직 공개되지 않았습니다. 공항·항공사 안내를 함께 확인해 주세요.
            </p>
          ) : null}

          {contextCta ? (
            <a
              href={contextCta.href}
              className="mt-3 flex items-center gap-3 rounded-xl bg-brand-soft/60 px-3 py-2.5 ring-1 ring-brand/20"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand">
                <contextCta.icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-bold text-ink">{contextCta.label}</span>
                <span className="block text-[10px] font-medium text-muted">{contextCta.desc}</span>
              </span>
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
