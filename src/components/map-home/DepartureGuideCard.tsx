import { useEffect, useState, type FormEvent } from 'react';
import { LayoutGrid, MapPinned, Smartphone } from 'lucide-react';
import {
  fetchIcnFlight,
  inputValueToYmd,
  todaySeoulYmd,
  ymdToInputValue,
  type IcnFlightResponse,
} from '../../lib/icnFlight';
import {
  buildDepartureGuide,
  formatStepMinutes,
  formatTotalMinutes,
  type CarParkingType,
  type TransportMode,
} from '../../utils/departureGuide';
import {
  ESIM_TAB_LABEL,
  HOME_CALCULATE_CTA,
  HOME_CALCULATING,
  HOME_RESULT_EYEBROW,
  PARKING_TAB_LABEL,
  SPOTS_TAB_LABEL,
} from '../../constants/marketing';
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

export default function DepartureGuideCard({
  onResultChange,
}: {
  onResultChange?: (hasResult: boolean) => void;
}) {
  const [flightId, setFlightId] = useState('');
  const [date, setDate] = useState(() => ymdToInputValue(todaySeoulYmd()));
  const [mode, setMode] = useState<TransportMode>('car');
  const [parking, setParking] = useState<CarParkingType>('long');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flight, setFlight] = useState<IcnFlightResponse | null>(null);

  useEffect(() => {
    onResultChange?.(flight != null);
  }, [flight, onResultChange]);

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
            : '운항 정보를 불러오지 못했습니다. 편명·날짜를 확인해 주세요.')
      );
      return;
    }
    setFlight(res.data);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await runLookup(flightId, inputValueToYmd(date) || todaySeoulYmd(), mode, parking);
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
              desc: '주소·길찾기·셔틀',
              icon: MapPinned,
            }
          : {
              href: '/esim',
              label: `${ESIM_TAB_LABEL} 요금 비교`,
              desc: '여행용 데이터',
              icon: Smartphone,
            };

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(49,130,246,0.08)] ring-1 ring-sky-border">
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-3 px-4 pb-4 pt-4">
        <div className="grid grid-cols-[1.35fr_1fr] gap-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold text-muted">항공편명</span>
            <input
              value={flightId}
              onChange={(e) => setFlightId(normalizeFlightInput(e.target.value))}
              placeholder="KE101"
              autoCapitalize="characters"
              spellCheck={false}
              className="w-full rounded-xl bg-sky-soft/90 px-3.5 py-3 text-base font-bold uppercase tracking-wide text-ink outline-none ring-1 ring-sky-border/70 placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:ring-2 focus:ring-brand/35"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold text-muted">출발일</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl bg-sky-soft/90 px-3 py-3 text-sm font-semibold text-ink outline-none ring-1 ring-sky-border/70 focus:ring-2 focus:ring-brand/35"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
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
          {mode === 'car'
            ? PARKING.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setParking(p.id)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                    parking === p.id
                      ? 'bg-ink text-white'
                      : 'bg-white text-muted ring-1 ring-sky-border/60'
                  }`}
                >
                  {p.label}
                </button>
              ))
            : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand py-3.5 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(49,130,246,0.35)] disabled:opacity-60"
        >
          {loading ? HOME_CALCULATING : HOME_CALCULATE_CTA}
        </button>
      </form>

      {error ? (
        <p className="border-t border-sky-border/50 px-4 py-3 text-[11px] font-medium leading-relaxed text-amber-700">
          {error}
        </p>
      ) : null}

      {flight ? (
        <div className="border-t border-sky-border/60 bg-sky-soft/30 px-4 py-4">
          <p className="text-[10px] font-bold tracking-wide text-brand">{HOME_RESULT_EYEBROW}</p>

          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <ResultChip label="항공" value={flight.airline || flight.flightId} />
            <ResultChip
              label="터미널"
              value={flight.terminal || flight.terminalLabel || '확인 중'}
            />
            <ResultChip
              label="체크인"
              value={flight.checkInCounter ? String(flight.checkInCounter) : '미정'}
            />
            <ResultChip label="공항 안 이동" value={totalLabel ?? '—'} emphasize />
          </div>

          <p className="mt-2 text-[10px] font-medium text-muted">
            {flight.flightId}
            {flight.destination ? ` · ${flight.destination}행` : ''}
            {flight.scheduleTime ? ` · 예정 ${flight.scheduleTime}` : ''}
            {flight.remark ? ` · ${flight.remark}` : ''}
          </p>
          {totalLabel && guide ? (
            <p className="mt-1 text-[10px] font-medium leading-relaxed text-muted">{guide.totalNote}</p>
          ) : null}

          {mode === 'car' && (flight.terminal === 'T1' || flight.terminal === 'T2') ? (
            <div className="mt-3">
              <DepartureGuideMap terminal={flight.terminal} parking={parking} />
            </div>
          ) : null}

          {guide && guide.steps.length > 0 ? (
            <ol className="mt-3 list-none space-y-2.5">
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
                        <span className="mt-0.5 block text-[10px] font-bold text-brand">{mins}</span>
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
              className="mt-4 flex items-center gap-3 rounded-xl bg-white px-3 py-3 ring-1 ring-brand/25"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
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

function ResultChip({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-2.5 ring-1 ${
        emphasize
          ? 'bg-brand-soft/80 ring-brand/25'
          : 'bg-white ring-sky-border/70'
      }`}
    >
      <p className="text-[9px] font-bold tracking-wide text-muted">{label}</p>
      <p
        className={`mt-0.5 truncate text-[13px] font-bold ${
          emphasize ? 'text-brand' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
