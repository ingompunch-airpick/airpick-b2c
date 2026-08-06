import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  fetchIcnFlight,
  inputValueToYmd,
  todaySeoulYmd,
  ymdToInputValue,
  type IcnFlightResponse,
  type IcnFlightSearchItem,
} from '../../lib/icnFlight';
import { fetchDriveEta } from '../../lib/driveEta';
import { fetchIcnAirportLive, type IcnAirportLiveResponse } from '../../lib/icnAirportLive';
import { resolveDriveGoal } from '../../data/driveDestinations';
import {
  airportInternalMinutes,
  leaveAirportSegmentLabel,
  leaveDriveLabel,
  leaveTravelModeToDriveArgs,
  showPeakTravelAdvisory,
  type LeaveTravelMode,
} from '../../utils/departureGuide';
import {
  clampTravelMinutes,
  computeLeaveBy,
  parseHmToMinutes,
  resolveAirportArriveMinutes,
} from '../../utils/leaveByCalculator';
import {
  HOME_CALCULATE_CTA,
  HOME_CALCULATING,
  HOME_LEAVE_DISCLAIMER,
  HOME_LONG_PARKING_BUSY_HINT,
  HOME_CHECKIN_COUNTER_LABEL,
  HOME_DEPARTURE_HALL_REF_HINT,
  formatDepartureHallLiveLine,
  HOME_NEXT_PREP,
  HOME_PEAK_ADVISORY,
  HOME_RESULT_EYEBROW_MODE,
  HOME_RESULT_SUMMARY_LINE,
  HOME_TO_COMPARE_LONG_LINE,
  HOME_TO_COMPARE_SAVED,
  HOME_TO_COMPARE_VALET_HEAD,
  HOME_TO_COMPARE_VALET_TIME,
  HOME_VALET_MODE_NOTE,
} from '../../constants/marketing';
import DateField from '../DateField';
import FlightIdCombobox from './FlightIdCombobox';
import type { AppTab, BookingSearch } from '../../types';
import { cn } from '../../utils/cn';

const PARKING_MODES: { id: LeaveTravelMode; label: string }[] = [
  { id: 'long', label: '장기주차' },
  { id: 'short', label: '단기주차' },
  { id: 'valet', label: '주차대행' },
];

const TRAVEL_FALLBACK_PRESETS = [40, 60, 90, 120] as const;
const EXAMPLE_FLIGHT = 'KE623';

type CongestionLevel = '여유' | '보통' | '혼잡' | '매우혼잡';

function normalizeFlightInput(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function congestionLevelTone(level: CongestionLevel): string {
  if (level === '여유') return 'bg-emerald-50 text-emerald-800 ring-emerald-200/80';
  if (level === '보통') return 'bg-sky-50 text-sky-800 ring-sky-200/80';
  if (level === '혼잡') return 'bg-amber-50 text-amber-800 ring-amber-200/80';
  return 'bg-rose-50 text-rose-800 ring-rose-200/80';
}

function CongestionLevelBadge({ level }: { level: CongestionLevel }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1',
        congestionLevelTone(level)
      )}
    >
      {level}
    </span>
  );
}

function parkingOccupancyLevel(occupied: number, total: number): CongestionLevel {
  if (total <= 0) return '보통';
  const rate = occupied / total;
  if (rate < 0.5) return '여유';
  if (rate < 0.75) return '보통';
  if (rate < 0.9) return '혼잡';
  return '매우혼잡';
}

function summarizeParkingKind(
  live: IcnAirportLiveResponse,
  kind: 'long' | 'short'
): { available: number; level: CongestionLevel } | null {
  if (!live.parking.available) return null;
  const terminal = live.terminal;
  const prefix = terminal === 'T2' ? 'T2' : 'T1';
  const lots = live.parking.lots ?? [];
  const relevant = lots.filter(
    (l) => l.name.includes(prefix) || l.name.includes(terminal)
  );
  const list = relevant.length > 0 ? relevant : lots;
  const filtered =
    kind === 'long'
      ? list.filter((l) => /장기|타워|P\d/i.test(l.name) && !/단기/i.test(l.name))
      : list.filter((l) => /단기/i.test(l.name));

  if (filtered.length > 0) {
    const occupied = filtered.reduce((a, l) => a + l.occupied, 0);
    const total = filtered.reduce((a, l) => a + l.total, 0);
    if (total > 0) {
      return {
        available: Math.max(0, total - occupied),
        level: parkingOccupancyLevel(occupied, total),
      };
    }
  }

  const available =
    kind === 'long' ? live.parking.longAvailable : live.parking.shortAvailable;
  if (!Number.isFinite(available)) return null;
  return { available, level: available > 800 ? '여유' : available > 200 ? '보통' : '혼잡' };
}

function addDaysYmd(ymdDash: string, days: number): string {
  const d = new Date(`${ymdDash}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ymdDash;
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DepartureGuideCard({
  onResultChange,
  onGoTab,
  onPrefillParkingSearch,
}: {
  onResultChange?: (hasResult: boolean) => void;
  onGoTab?: (tab: AppTab) => void;
  onPrefillParkingSearch?: (patch: Partial<BookingSearch>) => void;
}) {
  const [flightId, setFlightId] = useState('');
  /** 자동완성에서 고른 편 — 있으면 계산 시 상세 API 재호출 생략 */
  const [pickedFlight, setPickedFlight] = useState<IcnFlightSearchItem | null>(null);
  const [date, setDate] = useState(() => ymdToInputValue(todaySeoulYmd()));
  const [parking, setParking] = useState<LeaveTravelMode>('long');
  const [homeAddress, setHomeAddress] = useState('');
  const [travelMinutes, setTravelMinutes] = useState<number | null>(null);
  const [travelSource, setTravelSource] = useState<'manual' | 'naver' | null>(null);
  const [travelGoalLabel, setTravelGoalLabel] = useState<string | null>(null);
  const [etaLoading, setEtaLoading] = useState(false);
  const [etaError, setEtaError] = useState<string | null>(null);
  const [showTravelFallback, setShowTravelFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flight, setFlight] = useState<IcnFlightResponse | null>(null);
  const [airportLive, setAirportLive] = useState<IcnAirportLiveResponse | null>(null);
  const [airportLiveLoading, setAirportLiveLoading] = useState(false);

  useEffect(() => {
    onResultChange?.(flight != null);
  }, [flight, onResultChange]);

  useEffect(() => {
    if (!flight) return;
    const terminal = flight.terminal === 'T2' ? 'T2' : 'T1';
    let cancelled = false;
    void fetchIcnAirportLive(terminal).then((res) => {
      if (cancelled) return;
      setAirportLiveLoading(false);
      if (res.ok) setAirportLive(res.data);
      else setAirportLive(null);
    });
    return () => {
      cancelled = true;
    };
  }, [flight]);

  /** 자동완성으로 계산한 경우 체크인 카운터만 백그라운드 보강 */
  useEffect(() => {
    if (!flight?.flightId || flight.checkInCounter) return;
    let cancelled = false;
    void fetchIcnFlight(flight.flightId, flight.date).then((res) => {
      if (cancelled || !res.ok || !res.data.checkInCounter) return;
      setFlight((prev) =>
        prev && prev.flightId === res.data.flightId
          ? { ...prev, checkInCounter: res.data.checkInCounter }
          : prev
      );
    });
    return () => {
      cancelled = true;
    };
  }, [flight?.flightId, flight?.date, flight?.checkInCounter]);

  const departureYmd = inputValueToYmd(date) || todaySeoulYmd();
  const peakAdvisory = flight != null && showPeakTravelAdvisory(departureYmd);

  const driveGoalTerminal = (flight?.terminal === 'T1' || flight?.terminal === 'T2'
    ? flight.terminal
    : 'T1') as 'T1' | 'T2';

  const lookupDriveEta = async (
    terminal: 'T1' | 'T2' = driveGoalTerminal,
    nextParking: LeaveTravelMode = parking
  ): Promise<number | null> => {
    const addr = homeAddress.trim();
    if (addr.length < 2) {
      setEtaError('집 주소를 입력해 주세요.');
      setShowTravelFallback(true);
      return null;
    }
    const { transport, parking: park } = leaveTravelModeToDriveArgs(nextParking);
    const goal = resolveDriveGoal(terminal, transport, park);
    setEtaLoading(true);
    setEtaError(null);
    const res = await fetchDriveEta(addr, goal);
    setEtaLoading(false);
    if (!res.ok || !res.data?.durationMinutes) {
      setTravelSource(null);
      setShowTravelFallback(true);
      setEtaError(
        res.data?.message ||
          '길찾기를 불러오지 못했습니다. 이동 시간을 직접 선택해 주세요.'
      );
      return null;
    }
    const mins = clampTravelMinutes(res.data.durationMinutes);
    setHomeAddress(res.data.address || addr);
    setTravelMinutes(mins);
    setTravelSource('naver');
    setTravelGoalLabel(goal.label);
    setShowTravelFallback(false);
    return mins;
  };

  const selectManualTravel = (m: number) => {
    setTravelMinutes(m);
    setTravelSource('manual');
    setEtaError(null);
    setTravelGoalLabel(null);
  };

  const clearAutoTravel = () => {
    setTravelSource(null);
    setTravelMinutes(null);
    setTravelGoalLabel(null);
  };

  const runLookup = async (
    idRaw: string,
    dateYmd: string,
    nextParking: LeaveTravelMode
  ) => {
    const id = normalizeFlightInput(idRaw);
    if (!id) {
      setError(`항공편명을 입력해 주세요. 예: ${EXAMPLE_FLIGHT}`);
      return;
    }
    if (homeAddress.trim().length < 2) {
      setError('집 주소를 입력해 주세요.');
      return;
    }

    setFlightId(id);
    setParking(nextParking);
    setLoading(true);
    setError(null);
    setFlight(null);
    setAirportLive(null);

    let flightData: IcnFlightResponse | null = null;
    const fromPick =
      pickedFlight &&
      normalizeFlightInput(pickedFlight.flightId) === id &&
      !!pickedFlight.scheduleTime
        ? pickedFlight
        : null;

    if (fromPick) {
      flightData = {
        flightId: fromPick.flightId,
        airline: fromPick.airline,
        destination: fromPick.destination,
        destinationCode: fromPick.destinationCode,
        date: dateYmd || todaySeoulYmd(),
        scheduleTime: fromPick.scheduleTime,
        estimatedTime: fromPick.estimatedTime,
        remark: fromPick.remark,
        terminal: fromPick.terminal,
        terminalLabel: fromPick.terminalLabel,
        terminalId: null,
        checkInCounter: null,
        codeshare: fromPick.codeshare,
        masterFlightId: fromPick.masterFlightId,
      };
    } else {
      const flightRes = await fetchIcnFlight(id, dateYmd || todaySeoulYmd());
      if (!flightRes.ok) {
        setLoading(false);
        setError(
          flightRes.data?.message ||
            (flightRes.status === 404
              ? '해당 날짜에 출발편이 없습니다.'
              : '공항 운항 정보를 잠시 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
        );
        return;
      }
      flightData = flightRes.data;
    }

    if (!flightData.scheduleTime) {
      setLoading(false);
      setError(
        '이 편의 예정 출발 시각이 아직 공개되지 않았습니다. 편명·날짜를 다시 확인해 주세요.'
      );
      return;
    }

    const term = (flightData.terminal === 'T1' || flightData.terminal === 'T2'
      ? flightData.terminal
      : 'T1') as 'T1' | 'T2';

    let travel = travelMinutes;
    if (travelSource !== 'naver' || travel == null) {
      travel = await lookupDriveEta(term, nextParking);
      if (travel == null || travel < 10) {
        setLoading(false);
        setError(
          '집→공항 이동 시간을 확인하지 못했습니다. 주소를 다시 조회하거나 아래에서 분을 선택해 주세요.'
        );
        setShowTravelFallback(true);
        return;
      }
    }

    setTravelMinutes(travel);
    setFlight(flightData);
    setAirportLive(null);
    setAirportLiveLoading(true);
    setLoading(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await runLookup(flightId, inputValueToYmd(date) || todaySeoulYmd(), parking);
  };

  const airportMinutes = airportInternalMinutes(parking);

  const leavePlan = useMemo(() => {
    if (!flight || travelMinutes == null) return null;
    const arrive = resolveAirportArriveMinutes({ departureHm: flight.scheduleTime });
    if (arrive.arriveMinutes == null) return { error: arrive.error ?? null, plan: null, arrive };
    const plan = computeLeaveBy({
      arriveMinutes: arrive.arriveMinutes,
      travelMinutes: clampTravelMinutes(travelMinutes),
      airportMinutes,
    });
    return { error: plan ? null : '이동 시간을 확인해 주세요.', plan, arrive };
  }, [flight, travelMinutes, airportMinutes]);

  /** 주차대행 비교로 넘길 때 · 장기 vs 대행 출발 시각 */
  const leaveCompare = useMemo(() => {
    if (!leavePlan?.arrive?.arriveMinutes || travelMinutes == null) return null;
    const travel = clampTravelMinutes(travelMinutes);
    const arrive = leavePlan.arrive.arriveMinutes;
    const longPlan = computeLeaveBy({
      arriveMinutes: arrive,
      travelMinutes: travel,
      airportMinutes: airportInternalMinutes('long'),
    });
    const valetPlan = computeLeaveBy({
      arriveMinutes: arrive,
      travelMinutes: travel,
      airportMinutes: airportInternalMinutes('valet'),
    });
    if (!longPlan || !valetPlan) return null;
    const longM = parseHmToMinutes(longPlan.leaveByHm);
    const valetM = parseHmToMinutes(valetPlan.leaveByHm);
    if (longM == null || valetM == null) return null;
    let saved = valetM - longM;
    if (saved < 0) saved += 24 * 60;
    if (saved <= 0) return null;
    return {
      longLeaveByHm: longPlan.leaveByHm,
      valetLeaveByHm: valetPlan.leaveByHm,
      savedMinutes: saved,
    };
  }, [leavePlan, travelMinutes]);

  const parkingLiveSummary = useMemo(() => {
    if (!airportLive || parking === 'valet') return null;
    return summarizeParkingKind(airportLive, parking);
  }, [airportLive, parking]);

  /** 대행 CTA용 · 선택한 주차와 무관하게 장기주차장 혼잡만 */
  const longParkingLive = useMemo(() => {
    if (!airportLive) return null;
    return summarizeParkingKind(airportLive, 'long');
  }, [airportLive]);

  const parkingModeLabel =
    PARKING_MODES.find((m) => m.id === parking)?.label ?? PARKING_MODES[0].label;

  const hallLive = airportLive?.congestion.busiest ?? null;

  // short 선택 시 본문에 단기 혼잡도 표시 (장기는 CTA 설득용으로 유지)
  const selectedParkingLive = parking === 'short' ? parkingLiveSummary : longParkingLive;
  const selectedParkingBusy =
    selectedParkingLive?.level === '혼잡' || selectedParkingLive?.level === '매우혼잡';
  const selectedParkingLabel = parking === 'short' ? '지금 단기주차장' : '지금 장기주차장';

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(49,130,246,0.08)] ring-1 ring-sky-border">
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-3 px-4 pb-4 pt-4">
        <div className="grid grid-cols-[1fr_1.35fr] gap-2">
          <DateField
            label="출발일"
            value={date}
            onChange={(next) => {
              setDate(next);
              setPickedFlight(null);
              setFlight(null);
              setAirportLive(null);
              setError(null);
            }}
          />
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-muted">항공편명</span>
            <FlightIdCombobox
              value={flightId}
              onChange={(next) => {
                setFlightId(next);
                setPickedFlight(null);
                setFlight(null);
                setAirportLive(null);
                setError(null);
              }}
              onSelectFlight={(f) => {
                setFlightId(f.flightId);
                setPickedFlight(f);
                setFlight(null);
                setAirportLive(null);
                setError(null);
              }}
              dateYmd={departureYmd}
              placeholder={EXAMPLE_FLIGHT}
              disabled={loading || etaLoading}
            />
          </label>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-bold text-muted">출발지</p>
          <input
            value={homeAddress}
            onChange={(e) => {
              setHomeAddress(e.target.value);
              clearAutoTravel();
              setEtaError(null);
              setShowTravelFallback(false);
            }}
            placeholder="예: 서울시 강남구 …"
            className="w-full rounded-xl bg-sky-soft/90 px-3 py-2.5 text-sm font-semibold text-ink outline-none ring-1 ring-sky-border/70 placeholder:font-medium placeholder:text-muted focus:ring-2 focus:ring-brand/35"
          />
          {travelSource === 'naver' && travelMinutes != null ? (
            <p className="mt-1.5 text-[11px] font-bold text-brand">
              {leaveDriveLabel(parking)} 약 {travelMinutes}분
              {travelGoalLabel ? ` · ${travelGoalLabel}` : ''}
            </p>
          ) : (
            <p className="mt-1 text-[10px] font-medium text-muted">
              계산 시 자동차 길찾기로 반영합니다.
            </p>
          )}
          {etaError ? (
            <p className="mt-1 text-[10px] font-medium text-amber-700">{etaError}</p>
          ) : null}
          {showTravelFallback ? (
            <div className="mt-2">
              <p className="mb-1.5 text-[10px] font-bold text-muted">이동 시간 직접 선택</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {TRAVEL_FALLBACK_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectManualTravel(m)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                      travelMinutes === m && travelSource === 'manual'
                        ? 'bg-ink text-white'
                        : 'bg-white text-muted ring-1 ring-sky-border/60'
                    }`}
                  >
                    {m}분
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-bold text-muted">주차</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {PARKING_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setParking(m.id);
                  clearAutoTravel();
                  setEtaError(null);
                  setShowTravelFallback(false);
                  setFlight(null);
                  setAirportLive(null);
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                  parking === m.id
                    ? 'bg-brand text-white'
                    : 'bg-sky-soft/80 text-ink ring-1 ring-sky-border/60'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || etaLoading}
          className="w-full rounded-xl bg-brand py-3.5 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(49,130,246,0.35)] disabled:opacity-60"
        >
          {loading || etaLoading ? HOME_CALCULATING : HOME_CALCULATE_CTA}
        </button>
      </form>

      {error ? (
        <p className="border-t border-sky-border/50 px-4 py-3 text-[11px] font-medium leading-relaxed text-amber-700">
          {error}
        </p>
      ) : null}

      {flight && leavePlan?.plan ? (
        <div className="border-t border-sky-border/60 bg-sky-soft/30 px-4 py-4">
          <div className="rounded-2xl bg-brand px-4 py-5 text-white shadow-[0_8px_24px_rgba(49,130,246,0.35)]">
            <p className="text-[11px] font-bold opacity-90">
              {HOME_RESULT_EYEBROW_MODE(parkingModeLabel)}
            </p>
            <p className="mt-1 text-[2.5rem] font-bold leading-none tracking-tight">
              {leavePlan.plan.leaveByHm}
            </p>
            {leavePlan.arrive.departureHm ? (
              <p className="mt-3 text-[12px] font-semibold leading-snug text-white/90">
                {HOME_RESULT_SUMMARY_LINE({
                  flightHm: leavePlan.arrive.departureHm,
                  arriveHm: leavePlan.plan.arriveHm,
                  travelMinutes: leavePlan.plan.travelMinutes,
                })}
              </p>
            ) : null}
          </div>

          {leaveCompare && parking !== 'long' ? (
            <p className="mt-3 text-[13px] font-semibold leading-relaxed text-ink">
              {HOME_TO_COMPARE_LONG_LINE(leaveCompare.longLeaveByHm)}
            </p>
          ) : null}

          {(flight.checkInCounter ||
            flight.terminal ||
            flight.terminalLabel ||
            parking !== 'valet' ||
            hallLive ||
            airportLiveLoading) && (
            <div className="mt-3 space-y-2 rounded-xl bg-white px-3.5 py-3 ring-1 ring-sky-border/60">
              {flight.checkInCounter || flight.terminal || flight.terminalLabel ? (
                <p className="text-[12px] font-semibold leading-snug text-ink">
                  {[
                    flight.checkInCounter
                      ? HOME_CHECKIN_COUNTER_LABEL(flight.checkInCounter)
                      : null,
                    flight.terminal || flight.terminalLabel || null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              ) : null}

              {parking !== 'valet' ? (
                selectedParkingLive ? (
                  <div>
                    <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                      <span>{selectedParkingLabel}</span>
                      <CongestionLevelBadge level={selectedParkingLive.level} />
                    </p>
                    {selectedParkingBusy ? (
                      <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted">
                        {HOME_LONG_PARKING_BUSY_HINT}
                      </p>
                    ) : null}
                  </div>
                ) : airportLiveLoading ? (
                  <p className="text-[11px] font-medium text-muted">주차장 상황 확인 중…</p>
                ) : null
              ) : null}

              {hallLive ? (
                <div>
                  <p className="inline-flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-ink">
                    <span>{formatDepartureHallLiveLine(hallLive)}</span>
                    <CongestionLevelBadge level={hallLive.level} />
                  </p>
                  <p className="mt-1 text-[10px] font-medium leading-relaxed text-muted">
                    {HOME_DEPARTURE_HALL_REF_HINT}
                  </p>
                </div>
              ) : airportLiveLoading ? (
                <p className="text-[11px] font-medium text-muted">출국장 대기 확인 중…</p>
              ) : airportLive?.congestion.note ? (
                <p className="text-[11px] font-medium leading-relaxed text-muted">
                  {airportLive.congestion.note}
                </p>
              ) : null}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const depYmd =
                ymdToInputValue(flight.date) ||
                ymdToInputValue(inputValueToYmd(date) || todaySeoulYmd()) ||
                date;
              const terminal =
                flight.terminal === 'T2' || flight.terminal === 'T1'
                  ? flight.terminal
                  : 'T1';
              onPrefillParkingSearch?.({
                departureDate: depYmd,
                arrivalDate: addDaysYmd(depYmd, 6),
                terminal,
                arrivalTerminal: terminal,
              });
              onGoTab?.('compare');
            }}
            className="mt-4 block w-full rounded-xl bg-white px-4 py-3.5 text-left ring-1 ring-sky-border/80 shadow-[0_4px_14px_rgba(49,130,246,0.12)]"
          >
            {leaveCompare && parking !== 'valet' ? (
              <div className="space-y-1.5">
                <p className="text-[12px] font-bold text-ink">{HOME_TO_COMPARE_VALET_HEAD}</p>
                <p className="text-[18px] font-bold tracking-tight text-ink">
                  {HOME_TO_COMPARE_VALET_TIME(leaveCompare.valetLeaveByHm)}
                </p>
                <p className="text-[13px] font-bold text-brand">
                  {HOME_TO_COMPARE_SAVED(leaveCompare.savedMinutes)}
                </p>
              </div>
            ) : (
              <span className="block text-[13px] font-semibold leading-relaxed text-ink">
                {HOME_NEXT_PREP.parking.benefit}
              </span>
            )}
            <span className="mt-2.5 block text-[16px] font-bold text-brand">
              {HOME_NEXT_PREP.parking.cta} →
            </span>
          </button>

          <details className="group mt-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-sky-border/60">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[12px] font-bold text-ink [&::-webkit-details-marker]:hidden">
              <span>어떻게 계산했나요?</span>
              <ChevronDown
                size={16}
                strokeWidth={2.5}
                className="shrink-0 text-brand transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="mt-2.5 space-y-2.5 border-t border-sky-border/50 pt-2.5">
              <dl className="space-y-1.5 text-[12px]">
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-muted">비행기 출발</dt>
                  <dd className="font-bold text-ink">{leavePlan.arrive.departureHm}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-muted">공항 도착 목표</dt>
                  <dd className="font-bold text-ink">{leavePlan.plan.arriveHm}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-medium text-muted">{leaveDriveLabel(parking)}</dt>
                  <dd className="font-bold text-ink">{leavePlan.plan.travelMinutes}분</dd>
                </div>
                {parking === 'valet' ? (
                  <div className="flex justify-between gap-3">
                    <dt className="font-medium text-muted">{leaveAirportSegmentLabel(parking)}</dt>
                    <dd className="font-bold text-ink">미포함</dd>
                  </div>
                ) : (
                  <div className="flex justify-between gap-3">
                    <dt className="font-medium text-muted">
                      {leaveAirportSegmentLabel(parking)}
                    </dt>
                    <dd className="font-bold text-ink">{leavePlan.plan.airportMinutes}분</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3 border-t border-sky-border/50 pt-1.5">
                  <dt className="font-medium text-muted">추천 출발</dt>
                  <dd className="font-bold text-brand">{leavePlan.plan.leaveByHm}</dd>
                </div>
              </dl>
              {flight.flightId ? (
                <p className="text-[10px] font-medium text-muted">
                  {flight.flightId}
                  {flight.destination ? ` · ${flight.destination}행` : ''}
                  {flight.terminal || flight.terminalLabel
                    ? ` · ${flight.terminal || flight.terminalLabel}`
                    : ''}
                </p>
              ) : null}
              {parking === 'valet' ? (
                <p className="text-[11px] font-medium leading-relaxed text-muted">
                  {HOME_VALET_MODE_NOTE}
                </p>
              ) : null}
              {peakAdvisory ? (
                <p className="text-[11px] font-medium leading-relaxed text-amber-800">
                  {HOME_PEAK_ADVISORY}
                </p>
              ) : null}
              <p className="text-[10px] font-medium leading-relaxed text-muted">
                {HOME_LEAVE_DISCLAIMER}
              </p>
            </div>
          </details>
        </div>
      ) : flight && leavePlan?.error ? (
        <p className="border-t border-sky-border/50 px-4 py-3 text-[11px] font-medium leading-relaxed text-amber-700">
          {leavePlan.error}
        </p>
      ) : null}
    </section>
  );
}
