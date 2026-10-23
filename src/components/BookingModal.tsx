import { Check, ChevronDown, ClipboardList, Minus, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import BookingConsent from './BookingConsent';
import BookingPartnerSummary from './BookingPartnerSummary';
import DateField from './DateField';
import PriceBreakdownCard from './PriceBreakdownCard';
import TerminalFields from './TerminalFields';
import TimeField from './TimeField';
import AirlineSelect from './AirlineSelect';
import type { BookingSearch, Company, Terminal } from '../types';
import { displayCompanyName } from '../utils/display';
import { ensureAnonymousAuth, submitReservation, subscribeReservation, type BookingForm } from '../lib/reservations';
import { assertHourlyCapacityAvailable } from '../lib/hourlyCapacityFirestore';
import { bookingPolicyMessage, checkBookingPolicy } from '../utils/bookingPolicy';
import { formatDateDisplay, formatStayPhrase, todayYmd } from '../utils/dates';
import { cn } from '../utils/cn';
import { getPriceBreakdown, withAffiliateDiscount } from '../utils/pricing';
import { useAffiliateOffer } from '../context/AffiliateContext';
import { isAirpickPartner } from '../utils/compareSort';
import {
  companySupportsIndoor,
  companySupportsOutdoor,
  parkingTypeLabel,
} from '../utils/parkingType';
import { formatPhoneInput, isValidMobilePhone } from '../utils/contact';
import { isLikelyCarNumber } from '../utils/carNumber';
import { saveRecentReservation } from '../utils/recentReservation';
import { formatTerminalSummary } from '../utils/terminalLabels';
import { DEFAULT_CANCEL_CUTOFF_HOURS } from '../utils/reservationCancel';
import { companyValetFee } from '../utils/parkingType';
import { maxPointSpend, POINT_STEP_WON, subscribePointBalance } from '../lib/points';
import { handoffPlaceLine } from '../data/pickupPins';
import { itchaHandoffPlace } from '../data/itchaPickup';
import {
  hasSignupCoupon,
  isSavedBookerName,
  MEMBER_DISCOUNT_WON,
  memberHasFrequentInfo,
  readMember,
  rememberMemberReservation,
  subscribeMember,
} from '../lib/memberSession';
import {
  clearBookingDraft,
  readBookingDraft,
  saveBookingDraft,
  takeKakaoLoginError,
  takeKakaoProfileDraft,
} from '../lib/bookingDraft';
import { memberFromKakaoProfile, saveKakaoMember } from '../lib/members';
import {
  signInWithKakao,
  socialLoginErrorMessage,
  type SocialProviderId,
} from '../lib/socialAuth';

const FIELD_CLASS =
  'w-full rounded-xl border border-[#e4e7ec] bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-[#b0b6c0] focus:border-brand';

function draftFor(companyId: string) {
  const draft = readBookingDraft();
  return draft?.companyId === companyId ? draft : null;
}

const bookingShell =
  'fixed inset-x-0 top-[var(--app-header-h,60px)] bottom-[var(--app-tab-h,56px)] z-[80] flex justify-center bg-white';

function KakaoBubble() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0">
      <path
        fill="currentColor"
        d="M12 3C6.5 3 2 6.6 2 11.1c0 2.9 1.9 5.4 4.8 6.8-.2.7-1.1 4-1.1 4.1 0 .2.2.3.3.2.2 0 3.5-2.3 4.1-2.7.6.1 1.3.2 1.9.2 5.5 0 10-3.6 10-8.1S17.5 3 12 3z"
      />
    </svg>
  );
}

function savedBookerFields(): Pick<BookingForm, 'userName' | 'phone' | 'carModel' | 'carNumber'> {
  const member = readMember();
  if (!member || !memberHasFrequentInfo(member)) {
    return { userName: '', phone: '', carModel: '', carNumber: '' };
  }
  return {
    userName: isSavedBookerName(member.name) ? member.name.trim() : '',
    phone: member.phone,
    carModel: member.carModel?.trim() ?? '',
    carNumber: member.carNumber,
  };
}

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
  onDismiss,
  onSuccess,
}: {
  company: Company;
  search: BookingSearch;
  price: number;
  onClose: () => void;
  onDismiss: () => void;
  onSuccess: (reservationId: string) => void;
}) {
  const [search, setSearch] = useState<BookingSearch>(() => {
    const base = draftFor(company.id)?.search ?? initialSearch;
    return {
      ...base,
      arrivalTerminal: base.arrivalTerminal ?? base.terminal,
    };
  });
  const [differentArrivalTerminal, setDifferentArrivalTerminal] = useState(() => {
    const base = draftFor(company.id)?.search ?? initialSearch;
    return !!base.arrivalTerminal && base.arrivalTerminal !== base.terminal;
  });
  const [form, setForm] = useState<BookingForm>(() => {
    const saved = savedBookerFields();
    const draft = draftFor(company.id);
    if (draft) {
      const draftedName = draft.form.userName.trim();
      return {
        ...emptyForm(),
        ...draft.form,
        userName: isSavedBookerName(draftedName) ? draft.form.userName : saved.userName,
        phone: draft.form.phone.trim() || saved.phone,
        carModel: draft.form.carModel.trim() || saved.carModel,
        carNumber: draft.form.carNumber.trim() || saved.carNumber,
      };
    }
    return { ...emptyForm(), ...saved };
  });
  const formRef = useRef<HTMLFormElement>(null);
  const consentRef = useRef<HTMLDivElement>(null);
  const consentPulseTimer = useRef<number | null>(null);
  const [consentPulse, setConsentPulse] = useState(false);
  const asMemberRef = useRef(Boolean(readMember()));
  const [memberPreview, setMemberPreview] = useState(() => Boolean(readMember()));
  const [signupCoupon, setSignupCoupon] = useState(() => hasSignupCoupon(readMember()));
  const [pointBalance, setPointBalance] = useState(0);
  const [pointSpend, setPointSpend] = useState(0);
  const [pendingProvider, setPendingProvider] = useState<SocialProviderId | null>(null);
  const [pendingUid, setPendingUid] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [agreedPlatformTerms, setAgreedPlatformTerms] = useState(
    () => draftFor(company.id)?.agreedPlatformTerms === true
  );
  const [agreedServiceTerms, setAgreedServiceTerms] = useState(
    () => draftFor(company.id)?.agreedServiceTerms === true
  );
  const [agreedPrivacy, setAgreedPrivacy] = useState(
    () => draftFor(company.id)?.agreedPrivacy === true
  );
  const [agreedThirdParty, setAgreedThirdParty] = useState(
    () => draftFor(company.id)?.agreedThirdParty === true
  );
  const [marketingOptIn, setMarketingOptIn] = useState(
    () => draftFor(company.id)?.marketingOptIn === true
  );
  const [confirming, setConfirming] = useState(() => draftFor(company.id)?.confirmed === true);
  const [guestMode, setGuestMode] = useState(false);
  const [editSchedule, setEditSchedule] = useState(false);
  const [showOptionalNotes, setShowOptionalNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [completedPayable, setCompletedPayable] = useState(0);
  const pendingPointSpendRef = useRef(0);
  const [completedAsMember, setCompletedAsMember] = useState(false);
  const submittingRef = useRef(false);

  const arrivalTerminal = differentArrivalTerminal
    ? (search.arrivalTerminal ?? search.terminal)
    : search.terminal;

  /** 출국·귀국 중 한쪽이라도 T2면 T2 할증 1회 부과 */
  const isT2 = search.terminal === 'T2' || arrivalTerminal === 'T2';

  /** 출국장 핀이면 업체 발렛비를 금액에 포함한다 */
  const valetFee = search.faceToFace ? (companyValetFee(company, search.terminal) ?? 0) : 0;
  const faceToFaceApplied = search.faceToFace === true && valetFee > 0;
  const { offer: affiliateOffer } = useAffiliateOffer();
  const affiliateDiscountWon =
    isAirpickPartner(company) && affiliateOffer
      ? affiliateOffer.customerDiscountWon
      : 0;

  const breakdown = useMemo(() => {
    const base = getPriceBreakdown(
      company,
      search.departureDate,
      search.arrivalDate,
      search.isIndoor,
      isT2,
      search.departureTime,
      search.arrivalTime,
      search.isCardPayment === true,
      valetFee
    );
    return withAffiliateDiscount(base, affiliateDiscountWon);
  }, [company, search, isT2, valetFee, affiliateDiscountWon]);

  const couponWon = memberPreview && signupCoupon ? MEMBER_DISCOUNT_WON : 0;
  const payableBeforePoints = Math.max(0, breakdown.total - couponWon);
  const pointSpendCap = memberPreview ? maxPointSpend(pointBalance, payableBeforePoints) : 0;
  const pointSpendWon = Math.min(pointSpend, pointSpendCap);
  const payableTotal = Math.max(0, payableBeforePoints - pointSpendWon);

  const today = todayYmd();

  const phoneValid = isValidMobilePhone(form.phone);
  const carNumberValid = isLikelyCarNumber(form.carNumber);

  const consentsOk =
    agreedPlatformTerms && agreedServiceTerms && agreedPrivacy && agreedThirdParty;

  const focusConsents = () => {
    consentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setError('필수 약관에 동의해 주세요.');
    setConsentPulse(true);
    if (consentPulseTimer.current != null) window.clearTimeout(consentPulseTimer.current);
    consentPulseTimer.current = window.setTimeout(() => {
      setConsentPulse(false);
      consentPulseTimer.current = null;
    }, 1600);
  };

  const canSubmit =
    agreedPlatformTerms &&
    agreedServiceTerms &&
    agreedPrivacy &&
    agreedThirdParty &&
    form.userName.trim() &&
    phoneValid &&
    form.carModel.trim() &&
    carNumberValid &&
    form.departureAirline.trim() &&
    form.departureFlight.trim() &&
    form.arrivalAirline.trim() &&
    form.arrivalFlight.trim();

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

  const applyMember = (name: string, phone: string, uid?: string) => {
    if (!name.trim() || !isValidMobilePhone(phone)) return false;
    const existing = readMember();
    void saveKakaoMember({
      name: name.trim(),
      phone: phone.trim(),
      carNumber: form.carNumber.trim() || existing?.carNumber || '',
      carModel: form.carModel.trim() || existing?.carModel || '',
      reservationIds: existing?.reservationIds ?? [],
      provider: 'kakao',
      uid: uid || existing?.uid,
      createdAt: existing?.createdAt,
      marketingOptIn: marketingOptIn || existing?.marketingOptIn === true,
      nickname: existing?.nickname,
      photoUrl: existing?.photoUrl,
      frequentSaved: true,
    }).catch(() => {
      setError('카카오 로그인은 됐습니다. 회원 저장은 아직 연결 전입니다.');
    });
    asMemberRef.current = true;
    setMemberPreview(true);
    setPendingProvider(null);
    setError('');
    return true;
  };

  useEffect(() => subscribeMember(() => setSignupCoupon(hasSignupCoupon(readMember()))), []);

  useEffect(() => {
    const uid = readMember()?.uid;
    if (!memberPreview || !uid) {
      setPointBalance(0);
      setPointSpend(0);
      return;
    }
    return subscribePointBalance(uid, setPointBalance);
  }, [memberPreview]);

  useEffect(() => {
    if (!completedId) return;
    const requested = pendingPointSpendRef.current;
    let latest = 0;
    const unsub = subscribeReservation(completedId, (reservation) => {
      if (!reservation) return;
      latest = reservation.totalPrice;
      if (requested > 0 && reservation.pointSpendSettled !== true) return;
      setCompletedPayable(reservation.totalPrice);
    });
    const timer = window.setTimeout(() => {
      if (latest > 0) setCompletedPayable(latest);
    }, 8000);
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, [completedId]);

  useEffect(() => {
    if (!pendingProvider || memberPreview) return;
    applyMember(form.userName, form.phone, pendingUid);
    // 카카오에 전화번호가 없으면, 손님이 적는 즉시 할인을 붙인다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.userName, form.phone, pendingProvider, pendingUid, memberPreview]);

  useEffect(() => {
    const loginError = takeKakaoLoginError();
    if (loginError) setError(loginError);

    const profile = takeKakaoProfileDraft();
    if (!profile) return;
    const phone = form.phone.trim() || formatPhoneInput(profile.phone);
    const existing = readMember();
    void saveKakaoMember(
      memberFromKakaoProfile(profile, existing, {
        name: form.userName,
        phone: isValidMobilePhone(phone) ? phone : '',
        carNumber: form.carNumber,
        carModel: form.carModel,
      })
    );
    setForm((prev) => ({
      ...prev,
      phone: prev.phone.trim() || (isValidMobilePhone(phone) ? phone : prev.phone),
    }));
    if (!applyMember(form.userName, phone, profile.uid)) {
      setPendingProvider(profile.provider);
      setPendingUid(profile.uid);
      if (!form.userName.trim()) {
        setError('이름을 적어 주세요.');
      } else {
        setError('휴대전화 번호를 적어 주세요.');
      }
    }
    // 카카오 리다이렉트 복귀 직후 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.id]);

  const startKakaoLogin = async (): Promise<boolean> => {
    setAuthBusy(true);
    setError('');
    try {
      // 리다이렉트는 localhost에서 결과가 자주 사라진다. 팝업으로 바로 받는다.
      const profile = await signInWithKakao();
      const phone = form.phone.trim() || formatPhoneInput(profile.phone);
      const existing = readMember();
      await saveKakaoMember(
        memberFromKakaoProfile(profile, existing, {
          name: form.userName,
          phone: isValidMobilePhone(phone) ? phone : '',
          carNumber: form.carNumber,
          carModel: form.carModel,
        })
      );
      setForm((prev) => ({
        ...prev,
        phone: prev.phone.trim() || (isValidMobilePhone(phone) ? phone : prev.phone),
      }));
      if (!applyMember(form.userName, phone, profile.uid)) {
        setPendingProvider(profile.provider);
        setPendingUid(profile.uid);
        if (!form.userName.trim()) {
          setError('이름을 적어 주세요.');
        } else {
          setError('휴대전화 번호를 적어 주세요.');
        }
        return false;
      }
      return true;
    } catch (err) {
      console.error('kakao login failed', err);
      setError(socialLoginErrorMessage(err) || '로그인에 실패했습니다. 비회원으로 접수할 수 있습니다.');
      return false;
    } finally {
      setAuthBusy(false);
    }
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

  const bookingSearch = (): BookingSearch => ({
    ...search,
    arrivalTerminal: differentArrivalTerminal ? arrivalTerminal : search.terminal,
  });

  const persistDraft = (confirmed: boolean) => {
    saveBookingDraft({
      companyId: company.id,
      search: bookingSearch(),
      form,
      marketingOptIn,
      confirmed,
      agreedPlatformTerms,
      agreedServiceTerms,
      agreedPrivacy,
      agreedThirdParty,
    });
  };

  const openConfirm = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!consentsOk) {
      focusConsents();
      return;
    }
    if (!canSubmit) {
      setError('필수 항목과 약관 동의를 확인해 주세요.');
      return;
    }
    persistDraft(true);
    setError('');
    setConfirming(true);
  };

  const backToForm = () => {
    persistDraft(false);
    setConfirming(false);
    setError('');
  };

  const placeReservation = async (asMember: boolean) => {
    if (submittingRef.current) return;
    if (!consentsOk) {
      focusConsents();
      setConfirming(false);
      return;
    }

    let password = form.reservationPassword.trim();
    if (asMember && !/^\d{4}$/.test(password)) {
      password = String(Math.floor(1000 + Math.random() * 9000));
    }
    if (!asMember && !/^\d{4}$/.test(password)) {
      setError('비회원 접수는 비밀번호 4자리가 필요합니다.');
      return;
    }
    const bookingForm = { ...form, reservationPassword: password };
    const payload = bookingSearch();
    const usingCoupon = asMember && hasSignupCoupon(readMember());
    const payable = Math.max(0, breakdown.total - (usingCoupon ? MEMBER_DISCOUNT_WON : 0));
    const spend = asMember ? Math.min(pointSpend, maxPointSpend(pointBalance, payable)) : 0;

    submittingRef.current = true;
    asMemberRef.current = asMember;
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

      try {
        await ensureAnonymousAuth();
        await assertHourlyCapacityAvailable(
          company.id,
          payload.departureDate,
          payload.departureTime,
          {
            hourlyCapEnabled: company.hourlyCapEnabled,
            maxCarsPerHour: company.maxCarsPerHour,
          }
        );
      } catch (capErr) {
        setError(capErr instanceof Error ? capErr.message : '해당 시간대 예약이 마감되었습니다.');
        return;
      }

      const id = await submitReservation(
        company.id,
        company.name,
        payload,
        bookingForm,
        payable,
        search.faceToFace === true ? { valetFee } : undefined,
        affiliateOffer && isAirpickPartner(company)
          ? {
              code: affiliateOffer.code,
              customerDiscountWon: breakdown.affiliateDiscountWon ?? 0,
              referrerCreditWon: affiliateOffer.referrerCreditWon,
            }
          : undefined,
        marketingOptIn,
        spend
      );
      saveRecentReservation({
        id,
        carNumber: form.carNumber.trim(),
        arrivalDate: payload.arrivalDate,
      });
      if (asMember) {
        const next = rememberMemberReservation(id, form.carNumber.trim());
        if (next?.uid) {
          void saveKakaoMember({ ...next, marketingOptIn, signupCouponUsed: true }).catch(() => undefined);
        }
      }
      clearBookingDraft();
      pendingPointSpendRef.current = spend;
      setCompletedPayable(Math.max(0, payable - spend));
      setCompletedAsMember(asMember);
      setForm((prev) => ({ ...prev, reservationPassword: password }));
      setCompletedId(id);
    } catch (err) {
      console.error(err);
      const raw = err instanceof Error ? err.message : '';
      setError(
        raw.includes('Missing or insufficient permissions') || raw.includes('permission-denied')
          ? '예약 저장 권한이 없습니다. 잠시 후 다시 시도해 주세요. 계속되면 고객센터로 문의해 주세요.'
          : raw && raw !== 'Failed to fetch'
            ? raw.includes('Unsupported field value')
              ? '예약 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.'
              : raw
            : '예약 저장에 실패했습니다. Firebase 익명 로그인 설정을 확인해 주세요.'
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const chooseKakao = async () => {
    persistDraft(true);
    const ok = await startKakaoLogin();
    if (ok) await placeReservation(true);
  };

  if (completedId) {
    return (
      <div className={bookingShell}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-complete-title"
          className="h-full w-full max-w-lg overflow-y-auto bg-white px-6 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <Check size={32} className="text-brand" strokeWidth={3} />
          </div>
          <h2 id="booking-complete-title" className="mt-4 text-xl font-bold text-ink">
            예약이 접수되었습니다
          </h2>
          <p className="mt-1.5 text-sm font-medium text-muted">
            {displayCompanyName(company.name)} · {formatStayPhrase(breakdown.days)} 주차
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">카카오 알림톡으로 접수증이 갑니다.</p>

          <dl className="mt-5 space-y-2.5 rounded-2xl bg-[#f4f5f7] p-4 text-left">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">예약번호</dt>
              <dd className="font-mono text-sm font-bold text-ink break-all text-right">
                {completedId}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">일정</dt>
              <dd className="text-sm font-bold text-ink tabular-nums">
                {formatDateDisplay(search.departureDate)} → {formatDateDisplay(search.arrivalDate)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">터미널</dt>
              <dd className="text-sm font-bold text-ink">{terminalSummary}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-[13px] font-semibold text-muted">픽업지</dt>
              <dd className="text-right text-sm font-bold text-ink">
                {handoffPlaceLine(
                  search.faceToFace === true,
                  itchaHandoffPlace(company.id, company.name, search.terminal) ||
                    company.pickupLocation
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">차량번호</dt>
              <dd className="text-sm font-bold text-ink">{form.carNumber}</dd>
            </div>
            {faceToFaceApplied && (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[13px] font-semibold text-muted">대면 입고</dt>
                <dd className="text-sm font-bold text-brand">
                  요청{valetFee > 0 ? ` · +${valetFee.toLocaleString()}원` : ' · 무료'}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 border-t border-sky-border/60 pt-2.5">
              <dt className="text-[13px] font-semibold text-muted">결제 예정 금액</dt>
              <dd className="text-base font-bold text-brand tabular-nums">
                {completedPayable.toLocaleString()}원
              </dd>
            </div>
          </dl>

          {!completedAsMember ? (
          <div className="mt-4 rounded-2xl bg-brand/5 p-4 text-left ring-1 ring-brand/15">
            <p className="text-sm font-bold text-ink">예약 비밀번호를 꼭 기억해 주세요</p>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-muted">
              입력하신 4자리 비밀번호
              <span className="mx-1 rounded-md bg-white px-2 py-0.5 font-mono text-sm font-bold tracking-widest text-brand ring-1 ring-brand/20">
                {form.reservationPassword}
              </span>
              는 <span className="font-bold text-ink">예약 탭</span>에서 차량번호와 함께 입력해야
              입고 위치·사진을 확인할 수 있어요.
            </p>
            <p className="mt-2 text-[13px] font-semibold text-ink">
              카카오로 처음 접수하는 예약은 {MEMBER_DISCOUNT_WON.toLocaleString()}원 할인됩니다.
            </p>
          </div>
          ) : null}

          <button
            type="button"
            onClick={() => onSuccess(completedId)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
          >
            <ClipboardList size={16} strokeWidth={2.25} />
            내 예약 보기
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-2 w-full py-2 text-sm font-semibold text-muted"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  if (confirming) {
    const guestPayable = breakdown.total;
    const firstBookingPayable = Math.max(0, breakdown.total - MEMBER_DISCOUNT_WON);
    const shownPayable = memberPreview ? payableTotal : guestPayable;
    return (
      <div className={bookingShell}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-confirm-title"
          className="h-full w-full max-w-lg overflow-y-auto bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2"
        >
          <div className="mb-2 flex justify-end">
            <button type="button" onClick={onClose} aria-label="닫기" className="shrink-0 rounded-full p-2 hover:bg-sky-tint">
              <X size={20} className="text-muted" />
            </button>
          </div>
          <h2 id="booking-confirm-title" className="text-xl font-bold text-ink">
            이 내용이 맞나요?
          </h2>
          <p className="mt-1.5 text-sm font-medium text-muted">
            {memberPreview
              ? '맞으면 이 금액으로 접수합니다. 내 예약에서 바로 볼 수 있습니다.'
              : '맞으면 접수 방법을 고르세요. 입력한 내용은 저장되어 있습니다.'}
          </p>

          <dl className="mt-5 space-y-2.5 rounded-2xl bg-[#f4f5f7] p-4 text-left">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">업체</dt>
              <dd className="text-sm font-bold text-ink text-right">{displayCompanyName(company.name)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">일정</dt>
              <dd className="text-sm font-bold text-ink text-right tabular-nums">
                {formatDateDisplay(search.departureDate)} {search.departureTime}
                {' → '}
                {formatDateDisplay(search.arrivalDate)} {search.arrivalTime}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">조건</dt>
              <dd className="text-sm font-bold text-ink text-right">
                {terminalSummary} · {parkingTypeLabel(search.isIndoor)} · {formatStayPhrase(breakdown.days)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">이름</dt>
              <dd className="text-sm font-bold text-ink text-right">{form.userName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">연락처</dt>
              <dd className="text-sm font-bold text-ink text-right">{form.phone}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">차량</dt>
              <dd className="text-sm font-bold text-ink text-right">
                {form.carModel} · {form.carNumber}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">출국</dt>
              <dd className="text-sm font-bold text-ink text-right">
                {form.departureAirline} {form.departureFlight}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">귀국</dt>
              <dd className="text-sm font-bold text-ink text-right">
                {form.arrivalAirline} {form.arrivalFlight}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-sky-border/60 pt-2.5">
              <dt className="text-[13px] font-semibold text-muted">이용요금</dt>
              <dd className="text-base font-bold text-gold tabular-nums">{shownPayable.toLocaleString()}원</dd>
            </div>
          </dl>
          {memberPreview && pointSpendCap >= POINT_STEP_WON ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#f4f5f7] px-4 py-3">
              <div>
                <p className="text-[13px] font-semibold text-[#0f1a2e]">포인트</p>
                <p className="text-[13px] font-medium text-[#0f1a2e]/55">
                  보유 {pointBalance.toLocaleString()}원 · 5,000원 단위
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="포인트 줄이기"
                  disabled={pointSpendWon <= 0}
                  onClick={() => setPointSpend((prev) => Math.max(0, prev - POINT_STEP_WON))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0f1a2e] disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>
                <span className="min-w-[4.75rem] text-center text-[13px] font-bold tabular-nums text-[#0f1a2e]">
                  {pointSpendWon > 0 ? `${pointSpendWon.toLocaleString()}원` : '사용 안 함'}
                </span>
                <button
                  type="button"
                  aria-label="포인트 늘리기"
                  disabled={pointSpendWon >= pointSpendCap}
                  onClick={() => setPointSpend((prev) => Math.min(pointSpendCap, prev + POINT_STEP_WON))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0f1a2e] disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ) : null}

          {memberPreview ? (
            <button
              type="button"
              disabled={loading || authBusy}
              onClick={() => void placeReservation(true)}
              className="mt-5 w-full rounded-xl bg-brand py-3.5 text-[16px] font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {loading
                ? '접수 중…'
                : pointSpendWon > 0
                  ? `포인트 ${pointSpendWon.toLocaleString()}원 빼고 접수`
                  : signupCoupon
                    ? '5,000원 할인 적용하고 접수'
                    : '이 금액으로 접수'}
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={loading || authBusy}
                onClick={() => void chooseKakao()}
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] py-3.5 text-[16px] font-bold text-[#191919] disabled:opacity-60"
              >
                <KakaoBubble />
                {authBusy
                  ? '로그인 중…'
                  : `카카오로 접수 · 첫 예약 ${firstBookingPayable.toLocaleString()}원`}
              </button>
              {!guestMode ? (
                <button
                  type="button"
                  disabled={loading || authBusy}
                  onClick={() => setGuestMode(true)}
                  className="mt-2 w-full rounded-xl bg-[#f4f5f7] py-3 text-[15px] font-bold text-[#0f1a2e] disabled:opacity-60"
                >
                  비회원으로 접수
                </button>
              ) : (
              <>
              <label className="mt-4 block">
                <span className="mb-1 block text-[13px] font-bold text-muted">비회원 비밀번호 (4자리)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={form.reservationPassword}
                  onChange={(e) =>
                    setFormField('reservationPassword', e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  placeholder="숫자 4자리"
                  className={cn(
                    FIELD_CLASS,
                    'placeholder:tracking-normal',
                    form.reservationPassword ? 'tracking-widest' : 'tracking-normal'
                  )}
                />
                <span className="mt-1 block text-[13px] font-medium text-muted">
                  비회원 조회·취소에 사용합니다.
                </span>
              </label>
              <button
                type="button"
                disabled={loading || authBusy}
                onClick={() => void placeReservation(false)}
                className="mt-3 w-full rounded-xl bg-brand py-3.5 text-[16px] font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
              >
                {loading && !authBusy ? '접수 중…' : `비회원 접수 · ${guestPayable.toLocaleString()}원`}
              </button>
              </>
              )}
            </>
          )}
          <button
            type="button"
            onClick={backToForm}
            className="mt-2 w-full py-2 text-[13px] font-semibold text-[#0f1a2e]/70"
          >
            수정
          </button>
          {error ? <p className="mt-2 text-center text-[13px] font-semibold text-rose-500">{error}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={bookingShell}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="예약"
        className="flex h-full w-full max-w-lg flex-col bg-white"
      >
        <div className="flex shrink-0 justify-end px-3 pt-1">
          <button type="button" onClick={onClose} aria-label="닫기" className="shrink-0 rounded-full p-2 hover:bg-sky-tint">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <form
          id="booking-form"
          ref={formRef}
          onSubmit={openConfirm}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-6"
        >
          <BookingPartnerSummary company={company} isIndoor={search.isIndoor} />

          <section className="rounded-2xl bg-[#f4f5f7] p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-brand">선택한 일정</p>
                <p className="mt-1 text-sm font-bold text-ink tabular-nums">
                  {formatDateDisplay(search.departureDate)} {search.departureTime}
                  {' → '}
                  {formatDateDisplay(search.arrivalDate)} {search.arrivalTime}
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-muted">
                  {terminalSummary} · {parkingTypeLabel(search.isIndoor)} · {formatStayPhrase(breakdown.days)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditSchedule((v) => !v)}
                className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-bold text-brand"
              >
                {editSchedule ? '접기' : '일정 수정'}
                <ChevronDown
                  size={14}
                  className={cn('transition-transform', editSchedule && 'rotate-180')}
                />
              </button>
            </div>

            {editSchedule && (
              <div className="mt-3 space-y-3 border-t border-sky-border/60 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <DateField
                    label="맡기는 날"
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
                    label="찾는 날"
                    value={search.arrivalDate}
                    min={search.departureDate}
                    onChange={(arrivalDate) => setSearch((prev) => ({ ...prev, arrivalDate }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <TimeField
                    label="맡기는 시간"
                    value={search.departureTime}
                    onChange={(departureTime) => setSearch((prev) => ({ ...prev, departureTime }))}
                  />
                  <TimeField
                    label="찾는 시간"
                    value={search.arrivalTime}
                    onChange={(arrivalTime) => setSearch((prev) => ({ ...prev, arrivalTime }))}
                  />
                </div>

                <TerminalFields
                  departure={search.terminal}
                  arrival={arrivalTerminal}
                  differentArrival={differentArrivalTerminal}
                  onDepartureChange={setTerminal}
                  onDifferentArrivalChange={handleDifferentArrival}
                  onArrivalChange={(t) => setSearch((prev) => ({ ...prev, arrivalTerminal: t }))}
                  inactiveClassName="bg-sky-soft text-muted"
                />

                <p className="text-[13px] font-bold text-muted">주차 공간</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!companySupportsOutdoor(company)}
                    onClick={() => setSearch((prev) => ({ ...prev, isIndoor: false }))}
                    className={cn(
                      'rounded-xl py-2 text-[13px] font-bold transition-colors disabled:opacity-40',
                      !search.isIndoor ? 'bg-sky-deep text-brand' : 'bg-sky-soft text-muted'
                    )}
                  >
                    야외
                  </button>
                  <button
                    type="button"
                    disabled={!companySupportsIndoor(company)}
                    onClick={() => setSearch((prev) => ({ ...prev, isIndoor: true }))}
                    className={cn(
                      'rounded-xl py-2 text-[13px] font-bold transition-colors disabled:opacity-40',
                      search.isIndoor ? 'bg-sky-deep text-brand' : 'bg-sky-soft text-muted'
                    )}
                  >
                    실내
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-2xl bg-[#f4f5f7] p-4">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-[13px] font-bold text-muted">이름 *</span>
                <input
                  value={form.userName}
                  onChange={(e) => setFormField('userName', e.target.value)}
                  placeholder="홍길동"
                  className={FIELD_CLASS}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[13px] font-bold text-muted">연락처 *</span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setFormField('phone', formatPhoneInput(e.target.value))}
                  placeholder="010-1234-5678"
                  className={FIELD_CLASS}
                />
                {form.phone.trim() && !phoneValid ? (
                  <span className="mt-1 block text-[13px] font-semibold text-rose-500">
                    휴대전화 번호를 확인해 주세요.
                  </span>
                ) : null}
              </label>
              <label className="block">
                <span className="mb-1 block text-[13px] font-bold text-muted">차량 모델 *</span>
                <input
                  value={form.carModel}
                  onChange={(e) => setFormField('carModel', e.target.value)}
                  placeholder="그랜저 / 티코"
                  className={FIELD_CLASS}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[13px] font-bold text-muted">차량번호 *</span>
                <input
                  value={form.carNumber}
                  onChange={(e) => setFormField('carNumber', e.target.value)}
                  placeholder="12가 3456"
                  className={FIELD_CLASS}
                />
                {form.carNumber.trim() && !carNumberValid ? (
                  <span className="mt-1 block text-[13px] font-semibold text-rose-500">
                    차량번호를 확인해 주세요. 예: 12가3456
                  </span>
                ) : null}
              </label>
            </div>

            <div className="space-y-3 border-t border-sky-border/60 pt-3">
              <div>
                <p className="mb-2 text-[13px] font-bold text-[#0f1a2e]/70">출국</p>
                <div className="grid grid-cols-2 gap-2">
                  <AirlineSelect
                    label="항공사"
                    required
                    value={form.departureAirline}
                    onChange={(departureAirline) => setFormField('departureAirline', departureAirline)}
                  />
                  <label className="block">
                    <span className="mb-1 block text-[13px] font-bold text-muted">가는 편명 *</span>
                    <input
                      value={form.departureFlight}
                      onChange={(e) => setFormField('departureFlight', e.target.value.toUpperCase())}
                      placeholder="KE701"
                      className={FIELD_CLASS}
                    />
                  </label>
                </div>
                <p className="mt-1.5 text-[13px] font-medium text-muted">항공권에 적힌 영문과 숫자. 예: KE701</p>
              </div>
              <div>
                <p className="mb-2 text-[13px] font-bold text-[#0f1a2e]/70">귀국</p>
                <div className="grid grid-cols-2 gap-2">
                  <AirlineSelect
                    label="항공사"
                    required
                    value={form.arrivalAirline}
                    onChange={(arrivalAirline) => setFormField('arrivalAirline', arrivalAirline)}
                  />
                  <label className="block">
                    <span className="mb-1 block text-[13px] font-bold text-muted">오는 편명 *</span>
                    <input
                      value={form.arrivalFlight}
                      onChange={(e) => setFormField('arrivalFlight', e.target.value.toUpperCase())}
                      placeholder="KE702"
                      className={FIELD_CLASS}
                    />
                  </label>
                </div>
                <p className="mt-1.5 text-[13px] font-medium text-muted">늦으면 이 편명으로 맞춥니다.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowOptionalNotes((v) => !v)}
              className="inline-flex items-center gap-0.5 text-[13px] font-bold text-brand"
            >
              {showOptionalNotes ? '메모 접기' : '여행지·메모 (선택)'}
              <ChevronDown
                size={14}
                className={cn('transition-transform', showOptionalNotes && 'rotate-180')}
              />
            </button>

            {showOptionalNotes ? (
              <div className="space-y-2 border-t border-sky-border/60 pt-3">
                <label className="block">
                  <span className="mb-1 block text-[13px] font-bold text-muted">여행지</span>
                  <input
                    value={form.destination}
                    onChange={(e) => setFormField('destination', e.target.value)}
                    placeholder="오사카, 싱가포르"
                    className={FIELD_CLASS}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[13px] font-bold text-muted">기사님께 전달할 메시지</span>
                  <textarea
                    value={form.customerNotes}
                    onChange={(e) => setFormField('customerNotes', e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-[#e4e7ec] bg-white px-3 py-2 text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-[#b0b6c0] focus:border-brand"
                  />
                </label>
              </div>
            ) : null}
          </section>

          <PriceBreakdownCard
            breakdown={breakdown}
            memberDiscountWon={couponWon}
            pointSpendWon={pointSpendWon}
          />
          <p className="-mt-2 text-[13px] font-semibold text-muted">
            현장 결제 · 입고 {DEFAULT_CANCEL_CUTOFF_HOURS}시간 전까지 직접 취소, 이후는 업체 문의
          </p>

          <div
            ref={consentRef}
            className={cn(
              'rounded-2xl transition-shadow duration-300',
              consentPulse && 'ring-2 ring-gold ring-offset-2'
            )}
          >
          <BookingConsent
            agreedPlatformTerms={agreedPlatformTerms}
            agreedServiceTerms={agreedServiceTerms}
            agreedPrivacy={agreedPrivacy}
            agreedThirdParty={agreedThirdParty}
            marketingOptIn={marketingOptIn}
            onAgreedPlatformTermsChange={setAgreedPlatformTerms}
            onAgreedServiceTermsChange={setAgreedServiceTerms}
            onAgreedPrivacyChange={setAgreedPrivacy}
            onAgreedThirdPartyChange={setAgreedThirdParty}
            onMarketingOptInChange={setMarketingOptIn}
            providerName={displayCompanyName(company.name)}
          />
          </div>

        </form>
          <div className="shrink-0 border-t border-sky-border/70 bg-white px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <div className="mb-2">
              <p className="text-[13px] font-semibold text-muted">이용요금</p>
              <p className="text-xl font-bold tabular-nums text-ink">
                {payableTotal.toLocaleString()}원
              </p>
            </div>
            {!consentsOk ? (
              <p className="mb-2 text-center text-[13px] font-semibold text-[#0f1a2e]/70">
                약관에 동의하면 접수할 수 있어요
              </p>
            ) : null}
            <button
              type="submit"
              form="booking-form"
              className={cn(
                'w-full rounded-xl py-3.5 text-[16px] font-bold transition-colors',
                consentsOk
                  ? 'bg-brand text-white hover:bg-brand-dark'
                  : 'border border-[#c5cedd] bg-[#d7e0ec] text-[#1c2b45]'
              )}
            >
              접수
            </button>
            {error ? <p className="mt-2 text-center text-[13px] font-semibold text-rose-500">{error}</p> : null}
          </div>
      </div>
    </div>
  );
}
