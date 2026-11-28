import { Camera, Loader2, MessageSquareText } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  readItineraryFile,
  readItineraryText,
  type ItineraryFlight,
  type ItineraryResult,
} from '../lib/itinerary';
import { airlineNameForIata } from '../constants/airlines';
import { koreanClock, minusMinutes, shortKoreanDate } from '../utils/itinerarySchedule';
import { cn } from '../utils/cn';

export type ItineraryApply = {
  outbound: ItineraryFlight | null;
  inbound: ItineraryFlight | null;
  /** 출발 몇 분 전에 맡기는지 */
  offsetMinutes: number;
};

const HOUR_OPTIONS = [1, 2, 3, 4, 5, 6];
const MINUTE_OPTIONS = [0, 10, 20, 30, 40, 50];

const SELECT_CLASS =
  'rounded-lg border border-[#d8dee8] bg-white px-2.5 py-2 text-[15px] font-bold text-ink outline-none focus:border-brand';

function airlineLabel(f: ItineraryFlight): string {
  return airlineNameForIata(f.airlineCode) || f.airlineName || f.airlineCode;
}

function terminalLabel(t: 'T1' | 'T2' | null): string {
  if (t === 'T1') return ' · 제1터미널';
  if (t === 'T2') return ' · 제2터미널';
  return '';
}

/**
 * 예약 화면 「항공권·일정표 사진으로 채우기」
 * 사진·PDF 또는 카톡으로 받은 글자 → 서버에서 항공편만 읽음
 * → 손님이 확인하고 「출발 ○시간 ○분 전」만 고르면 일정·항공편 칸이 채워진다.
 */
export default function ItineraryAutofill({ onApply }: { onApply: (v: ItineraryApply) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ItineraryResult | null>(null);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [applied, setApplied] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [pasted, setPasted] = useState('');

  const pickFile = () => {
    setError('');
    inputRef.current?.click();
  };

  const read = async (job: () => Promise<ItineraryResult>) => {
    setBusy(true);
    setError('');
    setResult(null);
    setApplied(false);
    setHours('');
    setMinutes('');
    try {
      const res = await job();
      if (!res.ok || (!res.outbound && !res.inbound)) {
        setError(res.message || res.warnings?.[0] || '항공편을 찾지 못했어요. 직접 넣어 주세요.');
      } else {
        setResult(res);
        setTextOpen(false);
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    void read(() => readItineraryFile(file));
  };

  const offsetMinutes = hours && minutes ? Number(hours) * 60 + Number(minutes) : null;
  const out = result?.outbound ?? null;
  const inb = result?.inbound ?? null;
  const dropOff = out && offsetMinutes != null ? minusMinutes(out.date, out.time, offsetMinutes) : null;
  const canApply = !!result && (!out || offsetMinutes != null);

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*,application/pdf"
      className="hidden"
      aria-hidden
      tabIndex={-1}
      onChange={(e) => onFile(e.target.files?.[0])}
    />
  );

  if (applied && result) {
    return (
      <div className="rounded-xl bg-emerald-50 px-3 py-2.5 text-[14px] font-semibold text-emerald-900">
        <p>일정표대로 채웠어요. 위 일정과 요금도 바뀌었으니 한 번 확인해 주세요.</p>
        <ul className="mt-1.5 space-y-0.5 text-[13px] font-medium">
          {dropOff ? (
            <li>
              맡기는 때 · {shortKoreanDate(dropOff.date)} {koreanClock(dropOff.time)}
            </li>
          ) : null}
          {inb ? (
            <li>
              찾는 때 · {shortKoreanDate(inb.date)} {koreanClock(inb.time)}
            </li>
          ) : null}
        </ul>
        <button type="button" onClick={pickFile} className="mt-1.5 font-bold text-brand underline">
          다시 올리기
        </button>
        {fileInput}
      </div>
    );
  }

  if (!result) {
    return (
      <div>
        <button
          type="button"
          onClick={pickFile}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/40 bg-brand/5 px-3 py-3 text-[15px] font-bold text-brand transition active:scale-[0.99] disabled:opacity-70"
        >
          {busy ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Camera size={18} aria-hidden />}
          {busy ? '항공편 읽는 중… 20초쯤 걸려요' : '항공권·일정표 사진으로 채우기'}
        </button>
        <p className="mt-1.5 text-center text-[13px] font-medium text-muted">
          여행사 일정표 캡처, e-티켓 PDF도 돼요. 사진은 저장하지 않아요.
        </p>
        {textOpen ? (
          <div className="mt-2">
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={5}
              maxLength={6000}
              aria-label="카톡으로 받은 일정표 글자"
              placeholder="여행사에서 카톡·문자로 받은 일정표 글자를 그대로 붙여넣어 주세요."
              className="w-full rounded-lg border border-[#d8dee8] bg-white px-3 py-2.5 text-[14px] font-medium text-ink outline-none placeholder:text-[#b0b6c0] focus:border-brand"
            />
            <button
              type="button"
              disabled={busy || pasted.trim().length < 8}
              onClick={() => void read(() => readItineraryText(pasted))}
              className="mt-1.5 w-full rounded-lg bg-[#0f1a2e] px-3 py-2.5 text-[15px] font-bold text-white disabled:opacity-50"
            >
              {busy ? '항공편 읽는 중… 20초쯤 걸려요' : '이 글자로 채우기'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTextOpen(true);
              setError('');
            }}
            disabled={busy}
            className="mx-auto mt-1 flex items-center gap-1 text-[13px] font-bold text-brand underline"
          >
            <MessageSquareText size={14} aria-hidden />
            카톡 글자로 받았어요
          </button>
        )}
        {error ? <p className="mt-1.5 text-center text-[13px] font-semibold text-rose-500">{error}</p> : null}
        {fileInput}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#f4f5f7] p-3.5">
      <p className="text-[15px] font-bold text-ink">이렇게 읽었어요. 맞나요?</p>
      <dl className="mt-2.5 space-y-2 text-[14px]">
        {out ? (
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 font-bold text-muted">가는 편</dt>
            <dd className="font-semibold text-ink">
              {airlineLabel(out)} {out.flightNumber}
              <span className="block font-medium text-muted">
                {shortKoreanDate(out.date)} {koreanClock(out.time)} 인천 출발{terminalLabel(out.terminal)}
              </span>
            </dd>
          </div>
        ) : null}
        {inb ? (
          <div className="flex gap-3">
            <dt className="w-12 shrink-0 font-bold text-muted">오는 편</dt>
            <dd className="font-semibold text-ink">
              {airlineLabel(inb)} {inb.flightNumber}
              <span className="block font-medium text-muted">
                {shortKoreanDate(inb.date)} {koreanClock(inb.time)} 인천 도착{terminalLabel(inb.terminal)}
              </span>
            </dd>
          </div>
        ) : null}
      </dl>
      {result.warnings?.length ? (
        <ul className="mt-2 space-y-1">
          {result.warnings.map((w) => (
            <li key={w} className="text-[13px] font-semibold leading-snug text-amber-800">
              {w}
            </li>
          ))}
        </ul>
      ) : null}

      {out ? (
        <div className="mt-3 border-t border-[#0f1a2e]/8 pt-3">
          <p className="text-[14px] font-bold text-ink">차는 비행기 출발 몇 시간 전에 맡길까요?</p>
          <div className="mt-2 flex items-center gap-1.5 text-[15px] font-bold text-ink">
            출발
            <select
              aria-label="출발 몇 시간 전"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="" disabled>
                선택
              </option>
              {HOUR_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            시간
            <select
              aria-label="출발 몇 분 전"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="" disabled>
                선택
              </option>
              {MINUTE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            분 전
          </div>
          {dropOff ? (
            <p className="mt-2 text-[14px] font-semibold text-ink">
              맡기는 시간 · {shortKoreanDate(dropOff.date)} {koreanClock(dropOff.time)}
            </p>
          ) : null}
        </div>
      ) : null}
      {inb ? (
        <p className={cn('text-[14px] font-semibold text-ink', out ? 'mt-1' : 'mt-3')}>
          찾는 시간 · {shortKoreanDate(inb.date)} {koreanClock(inb.time)}
          <span className="block text-[13px] font-medium text-muted">
            비행기 도착 시간으로 맞춰요. 항공편이 실제로 도착하면 업체에 자동으로 알림이 가요.
          </span>
        </p>
      ) : null}

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          disabled={!canApply}
          onClick={() => {
            onApply({ outbound: out, inbound: inb, offsetMinutes: offsetMinutes ?? 0 });
            setApplied(true);
          }}
          className="rounded-lg bg-[#0f1a2e] px-3 py-2.5 text-[15px] font-bold text-white disabled:opacity-50"
        >
          {out && offsetMinutes == null ? '맡길 시간을 골라 주세요' : '이대로 채우기'}
        </button>
        <button
          type="button"
          onClick={pickFile}
          className="rounded-lg bg-white px-3 py-2.5 text-[14px] font-bold text-ink ring-1 ring-[#0f1a2e]/12"
        >
          다시 올리기
        </button>
      </div>
      {fileInput}
    </div>
  );
}
