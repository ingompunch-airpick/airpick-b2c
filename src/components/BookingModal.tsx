import { Check, ChevronDown, ClipboardList, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import BookingConsent from './BookingConsent';
import DateField from './DateField';
import PriceBreakdownCard from './PriceBreakdownCard';
import TerminalFields from './TerminalFields';
import TimeField from './TimeField';
import AirlineSelect from './AirlineSelect';
import { PARKING_TAB_LABEL } from '../constants/marketing';
import type { BookingSearch, Company, Terminal } from '../types';
import { displayCompanyName } from '../utils/display';
import { submitReservation, type BookingForm } from '../lib/reservations';
import { bookingPolicyMessage, checkBookingPolicy } from '../utils/bookingPolicy';
import { formatDateDisplay, todayYmd } from '../utils/dates';
import { cn } from '../utils/cn';
import { getPriceBreakdown } from '../utils/pricing';
import {
  companySupportsIndoor,
  companySupportsOutdoor,
  companyValetFee,
  parkingTypeLabel,
} from '../utils/parkingType';
import { formatPhoneInput } from '../utils/contact';
import { saveRecentReservation } from '../utils/recentReservation';
import { formatTerminalSummary } from '../utils/terminalLabels';

const emptyForm = (): BookingForm => ({
  userName: '',
  phone: '',
  carModel: '',
  carNumber: '',
  departureAirline: '',
  departureFlight: '',
  arrivalAirline: '',
  arrivalFlight: '',
  destination: '',
  customerNotes: '',
  reservationPassword: '',
});

export default function BookingModal({
  company,
  search: initialSearch,
  onClose,
  onSuccess,
}: {
  company: Company;
  search: BookingSearch;
  price: number;
  onClose: () => void;
  onSuccess: (reservationId: string) => void;
}) {
  const [search, setSearch] = useState<BookingSearch>(() => ({
    ...initialSearch,
    arrivalTerminal: initialSearch.arrivalTerminal ?? initialSearch.terminal,
  }));
  const [differentArrivalTerminal, setDifferentArrivalTerminal] = useState(
    () =>
      !!initialSearch.arrivalTerminal &&
      initialSearch.arrivalTerminal !== initialSearch.terminal
  );
  const [form, setForm] = useState<BookingForm>(emptyForm);
  const [agreedPlatformTerms, setAgreedPlatformTerms] = useState(false);
  const [agreedServiceTerms, setAgreedServiceTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedThirdParty, setAgreedThirdParty] = useState(false);
  const [editSchedule, setEditSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedId, setCompletedId] = useState<string | null>(null);

  const arrivalTerminal = differentArrivalTerminal
    ? (search.arrivalTerminal ?? search.terminal)
    : search.terminal;

  /** 출국·귀국 중 한쪽이라도 T2면 T2 할증 1회 부과 */
  const isT2 = search.terminal === 'T2' || arrivalTerminal === 'T2';

  /** 입점 예약 모달 — 손님이 대면 선택 + 업체가 해당 터미널 발렛 제공 시 발렛비 포함 */
  const valetFeeRaw = companyValetFee(company, search.terminal);
  const faceToFaceApplied = search.faceToFace === true && valetFeeRaw !== null;
  const valetFee = faceToFaceApplied ? valetFeeRaw ?? 0 : 0;

  const breakdown = useMemo(
    () =>
      getPriceBreakdown(
        company,
        search.departureDate,
        search.arrivalDate,
        search.isIndoor,
        isT2,
        search.departureTime,
        search.arrivalTime,
        search.isCardPayment === true,
        valetFee
      ),
    [company, search, arrivalTerminal, isT2, valetFee]
  );

  const today = todayYmd();

  const canSubmit =
    agreedPlatformTerms &&
    agreedServiceTerms &&
    agreedPrivacy &&
    agreedThirdParty &&
    form.userName.trim() &&
    form.phone.trim() &&
    form.carModel.trim() &&
    form.carNumber.trim() &&
    form.departureAirline.trim() &&
    form.departureFlight.trim() &&
    form.arrivalAirline.trim() &&
    form.arrivalFlight.trim() &&
    /^\d{4}$/.test(form.reservationPassword.trim());

  const setTerminal = (terminal: Terminal) => {
    setSearch((prev) => ({
      ...prev,
      terminal,
      arrivalTerminal: differentArrivalTerminal ? prev.arrivalTerminal : terminal,
    }));
  };

  const setFormField = <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const terminalSummary = formatTerminalSummary(search.terminal, arrivalTerminal);

  const handleDifferentArrival = (checked: boolean) => {
    setDifferentArrivalTerminal(checked);
    if (!checked) {
      setSearch((prev) => ({ ...prev, arrivalTerminal: prev.terminal }));
      return;
    }
    setSearch((prev) => ({
      ...prev,
      arrivalTerminal: prev.terminal === 'T1' ? 'T2' : 'T1',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('필수 항목과 약관 동의를 확인해 주세요.');
      return;
    }

    const payload: BookingSearch = {
      ...search,
      arrivalTerminal: differentArrivalTerminal ? arrivalTerminal : search.terminal,
    };

    setLoading(true);
    setError('');
    try {
      const localCheck = checkBookingPolicy(
        payload.departureDate,
        payload.arrivalDate,
        company.isOpen !== false,
        company.blockedDates ?? [],
        company.sameDayBookingBlocked === true
      );
      if (!localCheck.allowed) {
        setError(bookingPolicyMessage(localCheck, payload.departureDate, payload.arrivalDate));
        return;
      }

      const id = await submitReservation(
        company.id,
        company.name,
        payload,
        form,
        breakdown.total,
        faceToFaceApplied ? { valetFee } : undefined
      );
      saveRecentReservation({
        id,
        carNumber: form.carNumber.trim(),
        arrivalDate: payload.arrivalDate,
      });
      setCompletedId(id);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && err.message !== 'Failed to fetch'
          ? err.message.includes('Unsupported field value')
            ? '예약 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.'
            : err.message
          : '예약 저장에 실패했습니다. Firebase 익명 로그인 설정을 확인해 주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (completedId) {
    return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-sky-deep/60 p-4 backdrop-blur-sm sm:items-center">
        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-sky-soft p-6 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <Check size={32} className="text-brand" strokeWidth={3} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-ink">예약이 접수되었습니다</h2>
          <p className="mt-1.5 text-sm font-medium text-muted">
            {displayCompanyName(company.name)} · {breakdown.days}일 주차
          </p>

          <dl className="mt-5 space-y-2.5 rounded-2xl bg-sky-bg p-4 text-left ring-1 ring-sky-border/70">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-xs font-semibold text-muted">예약번호</dt>
              <dd className="font-mono text-sm font-bold text-ink">
                {completedId.replace('res_', '')}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-xs font-semibold text-muted">일정</dt>
              <dd className="text-sm font-bold text-ink tabular-nums">
                {formatDateDisplay(search.departureDate)} → {formatDateDisplay(search.arrivalDate)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-xs font-semibold text-muted">터미널</dt>
              <dd className="text-sm font-bold text-ink">{terminalSummary}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-xs font-semibold text-muted">차량번호</dt>
              <dd className="text-sm font-bold text-ink">{form.carNumber}</dd>
            </div>
            {faceToFaceApplied && (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-xs font-semibold text-muted">대면 입고</dt>
                <dd className="text-sm font-bold text-brand">
                  요청{valetFee > 0 ? ` · +${valetFee.toLocaleString()}원` : ' · 무료'}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 border-t border-sky-border/60 pt-2.5">
              <dt className="text-xs font-semibold text-muted">결제 예정 금액</dt>
              <dd className="text-base font-bold text-brand tabular-nums">
                {breakdown.total.toLocaleString()}원
              </dd>
            </div>
          </dl>

          <div className="mt-4 rounded-2xl bg-brand/5 p-4 text-left ring-1 ring-brand/15">
            <p className="text-sm font-bold text-ink">예약 비밀번호를 꼭 기억해 주세요</p>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-muted">
              입력하신 4자리 비밀번호
              <span className="mx-1 rounded-md bg-white px-2 py-0.5 font-mono text-sm font-bold tracking-widest text-brand ring-1 ring-brand/20">
                {form.reservationPassword}
              </span>
              는 <span className="font-bold text-ink">예약 탭</span>에서 차량번호와 함께 입력해야
              입고 위치·사진을 확인할 수 있어요.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSuccess(completedId)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
          >
            <ClipboardList size={16} strokeWidth={2.25} />
            예약 내역 보기
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full py-2 text-sm font-semibold text-muted"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-sky-deep/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-sky-soft p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand">에어픽 예약</p>
            <h2 className="text-lg font-bold text-ink">{displayCompanyName(company.name)}</h2>
            <p className="mt-1 text-xl font-bold text-brand tabular-nums">
              {breakdown.total.toLocaleString()}원
            </p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-full p-2 hover:bg-sky-tint">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <section className="rounded-2xl bg-sky-bg p-4 ring-1 ring-sky-border/70">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-brand">{PARKING_TAB_LABEL} 탭에서 선택한 일정</p>
                <p className="mt-1 text-sm font-bold text-ink tabular-nums">
                  {formatDateDisplay(search.departureDate)} → {formatDateDisplay(search.arrivalDate)}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-muted">
                  {terminalSummary} · {parkingTypeLabel(search.isIndoor)} · {breakdown.days}일
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditSchedule((v) => !v)}
                className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-brand"
              >
                {editSchedule ? '접기' : '일정 수정'}
                <ChevronDown
                  size={14}
                  className={cn('transition-transform', editSchedule && 'rotate-180')}
                />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <TimeField
                label="입고 시간"
                value={search.departureTime}
                onChange={(departureTime) => setSearch((prev) => ({ ...prev, departureTime }))}
              />
              <TimeField
                label="출고 시간"
                value={search.arrivalTime}
                onChange={(arrivalTime) => setSearch((prev) => ({ ...prev, arrivalTime }))}
              />
            </div>

            <div className="mt-3 border-t border-sky-border/60 pt-3">
              <TerminalFields
                departure={search.terminal}
                arrival={arrivalTerminal}
                differentArrival={differentArrivalTerminal}
                onDepartureChange={setTerminal}
                onDifferentArrivalChange={handleDifferentArrival}
                onArrivalChange={(t) => setSearch((prev) => ({ ...prev, arrivalTerminal: t }))}
                inactiveClassName="bg-sky-soft text-muted"
              />
            </div>

            {editSchedule && (
              <div className="mt-3 space-y-3 border-t border-sky-border/60 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <DateField
                    label="입고(출국)일"
                    value={search.departureDate}
                    min={today}
                    onChange={(departureDate) => {
                      setSearch((prev) => {
                        const next = { ...prev, departureDate };
                        if (next.arrivalDate < departureDate) {
                          next.arrivalDate = departureDate;
                        }
                        return next;
                      });
                    }}
                  />
                  <DateField
                    label="출고(입국)일"
                    value={search.arrivalDate}
                    min={search.departureDate}
                    onChange={(arrivalDate) => setSearch((prev) => ({ ...prev, arrivalDate }))}
                  />
                </div>

                <p className="text-[11px] font-bold text-muted">주차 공간</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!companySupportsIndoor(company)}
                    onClick={() => setSearch((prev) => ({ ...prev, isIndoor: true }))}
                    className={cn(
                      'rounded-xl py-2 text-xs font-bold transition-colors disabled:opacity-40',
                      search.isIndoor ? 'bg-sky-deep text-brand' : 'bg-sky-soft text-muted'
                    )}
                  >
                    실내
                  </button>
                  <button
                    type="button"
                    disabled={!companySupportsOutdoor(company)}
                    onClick={() => setSearch((prev) => ({ ...prev, isIndoor: false }))}
                    className={cn(
                      'rounded-xl py-2 text-xs font-bold transition-colors disabled:opacity-40',
                      !search.isIndoor ? 'bg-sky-deep text-brand' : 'bg-sky-soft text-muted'
                    )}
                  >
                    야외
                  </button>
                </div>
              </div>
            )}
          </section>

          <PriceBreakdownCard breakdown={breakdown} />

          <section className="space-y-3 rounded-2xl bg-sky-bg p-4 ring-1 ring-sky-border/70">
            <p className="text-xs font-bold text-brand">예약자 · 차량 · 항공</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">이름 *</span>
                <input
                  value={form.userName}
                  onChange={(e) => setFormField('userName', e.target.value)}
                  placeholder="홍길동"
                  className="w-full rounded-xl border border-sky-border bg-sky-soft px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">연락처 *</span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setFormField('phone', formatPhoneInput(e.target.value))}
                  placeholder="010-1234-5678"
                  className="w-full rounded-xl border border-sky-border bg-sky-soft px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">차량 모델 *</span>
                <input
                  value={form.carModel}
                  onChange={(e) => setFormField('carModel', e.target.value)}
                  placeholder="그랜저 / 티코"
                  className="w-full rounded-xl border border-sky-border bg-sky-soft px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">차량번호 *</span>
                <input
                  value={form.carNumber}
                  onChange={(e) => setFormField('carNumber', e.target.value)}
                  placeholder="12가 3456"
                  className="w-full rounded-xl border border-sky-border bg-sky-soft px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand"
                />
              </label>
            </div>

            <div className="space-y-3 border-t border-sky-border/60 pt-3">
              <div>
                <p className="mb-2 text-[11px] font-bold text-brand">출국</p>
                <div className="grid grid-cols-2 gap-2">
                  <AirlineSelect
                    label="항공사"
                    required
                    value={form.departureAirline}
                    onChange={(departureAirline) => setFormField('departureAirline', departureAirline)}
                  />
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-muted">편명 *</span>
                    <input
                      value={form.departureFlight}
                      onChange={(e) => setFormField('departureFlight', e.target.value.toUpperCase())}
                      placeholder="KE101"
                      className="w-full rounded-xl border border-sky-border bg-sky-soft px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand"
                    />
                  </label>
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-bold text-brand">입국</p>
                <div className="grid grid-cols-2 gap-2">
                  <AirlineSelect
                    label="항공사"
                    required
                    value={form.arrivalAirline}
                    onChange={(arrivalAirline) => setFormField('arrivalAirline', arrivalAirline)}
                  />
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-muted">편명 *</span>
                    <input
                      value={form.arrivalFlight}
                      onChange={(e) => setFormField('arrivalFlight', e.target.value.toUpperCase())}
                      placeholder="KE102"
                      className="w-full rounded-xl border border-sky-border bg-sky-soft px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-sky-border/60 pt-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">여행지</span>
                <input
                  value={form.destination}
                  onChange={(e) => setFormField('destination', e.target.value)}
                  placeholder="오사카, 싱가포르"
                  className="w-full rounded-xl border border-sky-border bg-sky-soft px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">예약 비밀번호 (4자리) *</span>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={form.reservationPassword}
                  onChange={(e) =>
                    setFormField('reservationPassword', e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  className="w-full rounded-xl border border-sky-border bg-sky-soft px-3 py-2.5 text-sm font-semibold tracking-widest text-ink outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">기사님께 전달할 메시지 (선택)</span>
                <textarea
                  value={form.customerNotes}
                  onChange={(e) => setFormField('customerNotes', e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-sky-border bg-sky-soft px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-brand"
                />
              </label>
            </div>
          </section>

          <BookingConsent
            agreedPlatformTerms={agreedPlatformTerms}
            agreedServiceTerms={agreedServiceTerms}
            agreedPrivacy={agreedPrivacy}
            agreedThirdParty={agreedThirdParty}
            onAgreedPlatformTermsChange={setAgreedPlatformTerms}
            onAgreedServiceTermsChange={setAgreedServiceTerms}
            onAgreedPrivacyChange={setAgreedPrivacy}
            onAgreedThirdPartyChange={setAgreedThirdParty}
            providerName={displayCompanyName(company.name)}
          />

          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? '접수 중…' : '예약 접수하기'}
          </button>
          <p className="text-center text-[10px] text-muted-light">
            접수 후 B2B 기사 앱 입고예정에 표시됩니다 · 현장 결제
          </p>
        </form>
      </div>
    </div>
  );
}
