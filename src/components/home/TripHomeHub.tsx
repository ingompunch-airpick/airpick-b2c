import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import DateField from '../DateField';
import TimeField from '../TimeField';
import { inputValueToYmd, todaySeoulYmd, ymdToInputValue } from '../../lib/icnFlight';
import { fetchDriveEta } from '../../lib/driveEta';
import { resolveDriveGoal } from '../../data/driveDestinations';
import {
  airportInternalMinutes,
  leaveAirportSegmentLabel,
  leaveDriveLabel,
  leaveTravelModeToDriveArgs,
  showPeakTravelAdvisory,
} from '../../utils/departureGuide';
import {
  clampTravelMinutes,
  computeLeaveBy,
  parseHmToMinutes,
} from '../../utils/leaveByCalculator';
import { formatDateDisplay } from '../../utils/dates';
import { getParkingDayCount } from '../../utils/pricing';
import {
  APP_TAB_SOON,
  HOME_CALCULATING,
  HOME_LEAVE_DISCLAIMER,
  HOME_NEXT_PREP,
  HOME_PEAK_ADVISORY,
  HOME_TRIP_CONTINUE_CTA,
  HOME_VALET_MODE_NOTE,
} from '../../constants/marketing';
import type { AppTab, BookingSearch, EsimSearch, Terminal } from '../../types';
import { cn } from '../../utils/cn';

const TRAVEL_FALLBACK_PRESETS = [40, 60, 90, 120] as const;

function addDaysInput(ymdDash: string, days: number): string {
  const d = new Date(`${ymdDash}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ymdDash;
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function defaultDepartureDate(): string {
  return ymdToInputValue(todaySeoulYmd()) || new Date().toISOString().slice(0, 10);
}

export default function TripHomeHub({
  onResultChange,
  onGoTab,
  onPrefillParkingSearch,
  onPrefillEsimSearch,
}: {
  onResultChange?: (hasResult: boolean) => void;
  onGoTab?: (tab: AppTab) => void;
  onPrefillParkingSearch?: (patch: Partial<BookingSearch>) => void;
  onPrefillEsimSearch?: (patch: Partial<EsimSearch>) => void;
}) {
  const [step, setStep] = useState<'input' | 'result'>('input');

  const [departureDate, setDepartureDate] = useState(defaultDepartureDate);
  const [departureTime, setDepartureTime] = useState('09:20');
  const [terminal, setTerminal] = useState<Terminal>('T1');
  const [arrivalDate, setArrivalDate] = useState(() => addDaysInput(defaultDepartureDate(), 5));
  const [arrivalTime, setArrivalTime] = useState('18:30');
  const [arrivalTerminal, setArrivalTerminal] = useState<Terminal>('T1');

  const [formError, setFormError] = useState<string | null>(null);

  const [homeAddress, setHomeAddress] = useState('');
  const [travelMinutes, setTravelMinutes] = useState<number | null>(null);
  const [travelSource, setTravelSource] = useState<'manual' | 'naver' | null>(null);
  const [etaLoading, setEtaLoading] = useState(false);
  const [etaError, setEtaError] = useState<string | null>(null);
  const [showTravelFallback, setShowTravelFallback] = useState(false);
  const [leaveReady, setLeaveReady] = useState(false);

  useEffect(() => {
    onResultChange?.(step === 'result');
  }, [step, onResultChange]);

  const departureYmd8 = inputValueToYmd(departureDate) || todaySeoulYmd();
  const days = getParkingDayCount(departureDate, arrivalDate);
  const peakAdvisory = showPeakTravelAdvisory(departureYmd8);

  const continueToResult = (e?: FormEvent) => {
    e?.preventDefault();
    setFormError(null);
    if (!departureDate || !arrivalDate) {
      setFormError('맡기는 날·찾는 날을 입력해 주세요.');
      return;
    }
    if (arrivalDate < departureDate) {
      setFormError('찾는 날은 맡기는 날 이후여야 합니다.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(departureTime) || !/^\d{2}:\d{2}$/.test(arrivalTime)) {
      setFormError('맡기는·찾는 시간을 선택해 주세요.');
      return;
    }
    if (arrivalDate === departureDate && arrivalTime <= departureTime) {
      setFormError('찾는 시간이 맡기는 시간보다 빠릅니다.');
      return;
    }
    setLeaveReady(false);
    setStep('result');
  };

  const clearAutoTravel = () => {
    setTravelSource(null);
    setTravelMinutes(null);
    setLeaveReady(false);
  };

  const lookupDriveEta = async (): Promise<number | null> => {
    const addr = homeAddress.trim();
    if (addr.length < 2) {
      setEtaError('집 주소를 입력해 주세요.');
      setShowTravelFallback(true);
      return null;
    }
    const { transport, parking: park } = leaveTravelModeToDriveArgs('valet');
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
    setShowTravelFallback(false);
    return mins;
  };

  const runLeaveBy = async () => {
    let travel = travelMinutes;
    if (travelSource !== 'naver' || travel == null) {
      travel = await lookupDriveEta();
      if (travel == null) return;
    }
    setTravelMinutes(travel);
    setLeaveReady(true);
  };

  const leavePlan = useMemo(() => {
    if (!leaveReady || travelMinutes == null) return null;
    /** 맡기는 시간 = 공항에서 차 넘기는 시각 (= 공항 도착 목표) */
    const arriveMinutes = parseHmToMinutes(departureTime);
    if (arriveMinutes == null) {
      return {
        error: '맡기는 시간을 확인해 주세요.',
        plan: null,
        arrive: {
          arriveMinutes: null,
          arriveHm: null,
          departureHm: null as string | null,
          label: '차 맡기기',
        },
      };
    }
    const arrive = {
      arriveMinutes,
      arriveHm: departureTime,
      departureHm: null as string | null,
      label: `차 맡기기 ${departureTime}`,
    };
    const plan = computeLeaveBy({
      arriveMinutes,
      travelMinutes: clampTravelMinutes(travelMinutes),
      airportMinutes: airportInternalMinutes('valet'),
    });
    return { error: plan ? null : '이동 시간을 확인해 주세요.', plan, arrive };
  }, [leaveReady, travelMinutes, departureTime]);

  const goParkingCompare = () => {
    onPrefillParkingSearch?.({
      departureDate,
      arrivalDate,
      departureTime,
      arrivalTime,
      terminal,
      arrivalTerminal,
    });
    onGoTab?.('compare');
  };

  const goEsimCompare = () => {
    onPrefillEsimSearch?.({
      days: Math.max(1, days),
      simType: 'esim',
    });
    onGoTab?.('esim');
  };

  if (step === 'result') {
    return (
      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(49,130,246,0.08)] ring-1 ring-sky-border">
        <div className="flex items-start justify-between gap-3 border-b border-sky-border/50 px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-brand">차 맡기기 → 찾기</p>
            <p className="mt-0.5 text-[15px] font-bold text-ink">
              {formatDateDisplay(departureDate)} {departureTime} → {formatDateDisplay(arrivalDate)}{' '}
              {arrivalTime}
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-muted">
              출국 {terminal}
              {arrivalTerminal !== terminal ? ` · 입국 ${arrivalTerminal}` : ''} · {days}일
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStep('input')}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-brand ring-1 ring-sky-border/70"
          >
            수정
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <article className="rounded-xl bg-sky-soft/50 px-3.5 py-3.5 ring-1 ring-sky-border/70">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-ink">주차대행</p>
              <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                1
              </span>
            </div>
            <p className="mt-1 text-[12px] font-semibold text-ink">
              인천공항 {terminal} · {days}일
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-muted">
              야간 할증·실후기·보험 반영 · 최저가부터
            </p>
            <button
              type="button"
              onClick={goParkingCompare}
              className="mt-3 w-full rounded-xl bg-brand py-3 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(49,130,246,0.35)]"
            >
              {HOME_NEXT_PREP.parking.cta}
            </button>
          </article>

          {!APP_TAB_SOON.esim ? (
            <article className="rounded-xl bg-white px-3.5 py-3.5 ring-1 ring-sky-border/70">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-bold text-ink">eSIM</p>
                <span className="rounded-full bg-sky-tint px-2 py-0.5 text-[10px] font-bold text-brand">
                  2
                </span>
              </div>
              <p className="mt-1 text-[12px] font-semibold text-ink">{days}일</p>
              <p className="mt-0.5 text-[11px] font-medium text-muted">용량·가격 비교</p>
              <button
                type="button"
                onClick={goEsimCompare}
                className="mt-3 w-full rounded-xl bg-sky-bg py-2.5 text-[14px] font-bold text-ink ring-1 ring-sky-border/80"
              >
                {HOME_NEXT_PREP.esim.cta}
              </button>
            </article>
          ) : null}

          <article className="rounded-xl bg-white px-3.5 py-3.5 ring-1 ring-sky-border/70">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-ink">출발시각</p>
              <span className="rounded-full bg-sky-soft px-2 py-0.5 text-[10px] font-bold text-muted">
                {APP_TAB_SOON.esim ? '2' : '3'}
              </span>
            </div>

            {leavePlan?.plan ? (
              <div className="mt-2">
                <p className="text-[22px] font-bold tracking-tight text-ink">
                  집 → {leavePlan.plan.leaveByHm} 출발 추천
                </p>
                <p className="mt-1 text-[11px] font-medium text-muted">
                  차 맡기기 {leavePlan.plan.arriveHm} 기준 · 주차대행 경로 · 이동 약{' '}
                  {leavePlan.plan.travelMinutes}분
                </p>
                {peakAdvisory ? (
                  <p className="mt-2 text-[11px] font-medium leading-relaxed text-amber-800">
                    {HOME_PEAK_ADVISORY}
                  </p>
                ) : null}
                <details className="group mt-2.5">
                  <summary className="flex cursor-pointer list-none items-center gap-1 text-[11px] font-bold text-brand [&::-webkit-details-marker]:hidden">
                    어떻게 계산했나요?
                    <ChevronDown
                      size={14}
                      className="transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <dl className="mt-2 space-y-1.5 border-t border-sky-border/50 pt-2 text-[11px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">차 맡기기 (공항 도착)</dt>
                      <dd className="font-bold text-ink">{leavePlan.plan.arriveHm}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">{leaveDriveLabel('valet')}</dt>
                      <dd className="font-bold text-ink">{leavePlan.plan.travelMinutes}분</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">{leaveAirportSegmentLabel('valet')}</dt>
                      <dd className="font-bold text-ink">미포함</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-[10px] font-medium leading-relaxed text-muted">
                    {HOME_VALET_MODE_NOTE}
                  </p>
                  <p className="mt-1 text-[10px] font-medium leading-relaxed text-muted">
                    {HOME_LEAVE_DISCLAIMER}
                  </p>
                </details>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-[11px] font-medium text-muted">
                  집 주소를 넣으면 추천 출발 시각을 계산해요.
                </p>
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
                {etaError ? (
                  <p className="text-[10px] font-medium text-amber-700">{etaError}</p>
                ) : null}
                {showTravelFallback ? (
                  <div className="flex flex-wrap gap-1.5">
                    {TRAVEL_FALLBACK_PRESETS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setTravelMinutes(m);
                          setTravelSource('manual');
                          setLeaveReady(true);
                          setEtaError(null);
                        }}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-[11px] font-bold',
                          travelMinutes === m && travelSource === 'manual'
                            ? 'bg-ink text-white'
                            : 'bg-sky-bg text-muted ring-1 ring-sky-border/60'
                        )}
                      >
                        {m}분
                      </button>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={etaLoading}
                  onClick={() => void runLeaveBy()}
                  className="w-full rounded-xl bg-sky-bg py-2.5 text-[14px] font-bold text-ink ring-1 ring-sky-border/80 disabled:opacity-60"
                >
                  {etaLoading ? HOME_CALCULATING : '출발 시각 계산하기'}
                </button>
                {leavePlan?.error ? (
                  <p className="text-[10px] font-medium text-amber-700">{leavePlan.error}</p>
                ) : null}
              </div>
            )}
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(49,130,246,0.08)] ring-1 ring-sky-border">
      <form onSubmit={continueToResult} className="space-y-3.5 px-4 pb-4 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <DateField
            label="맡기는 날"
            value={departureDate}
            onChange={(next) => {
              setDepartureDate(next);
              if (arrivalDate < next) setArrivalDate(addDaysInput(next, 5));
            }}
          />
          <TimeField label="맡기는 시간" value={departureTime} onChange={setDepartureTime} />
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-bold text-muted">출국 터미널</p>
          <div className="flex gap-2">
            {(['T1', 'T2'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTerminal(t);
                  setArrivalTerminal((prev) => (prev === terminal ? t : prev));
                }}
                className={cn(
                  'flex-1 rounded-xl py-2.5 text-[13px] font-bold transition',
                  terminal === t
                    ? 'bg-brand text-white'
                    : 'bg-sky-soft/80 text-ink ring-1 ring-sky-border/60'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <DateField
            label="찾는 날"
            value={arrivalDate}
            min={departureDate}
            onChange={setArrivalDate}
          />
          <TimeField label="찾는 시간" value={arrivalTime} onChange={setArrivalTime} />
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-bold text-muted">입국 터미널</p>
          <div className="flex gap-2">
            {(['T1', 'T2'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setArrivalTerminal(t)}
                className={cn(
                  'flex-1 rounded-xl py-2.5 text-[13px] font-bold transition',
                  arrivalTerminal === t
                    ? 'bg-brand text-white'
                    : 'bg-sky-soft/80 text-ink ring-1 ring-sky-border/60'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] font-medium text-muted">
          맡기는·찾는 시간으로 야간 할증을 반영합니다. 항공편은 예약 단계에서 입력해요.
        </p>

        {formError ? (
          <p className="text-[11px] font-medium leading-relaxed text-amber-700">{formError}</p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-xl bg-brand py-3.5 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(49,130,246,0.35)]"
        >
          {HOME_TRIP_CONTINUE_CTA}
        </button>
      </form>
    </section>
  );
}
