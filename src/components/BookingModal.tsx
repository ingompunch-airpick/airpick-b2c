import {
  Calendar,
  Car,
  Check,
  ChevronDown,
  ClipboardList,
  KeyRound,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import BookingConsent from './BookingConsent';
import DateField from './DateField';
import TerminalFields from './TerminalFields';
import TimeField from './TimeField';
import AirlineSelect from './AirlineSelect';
import type { BookingSearch, Company, Terminal } from '../types';
import { displayCompanyName } from '../utils/display';
import {
  ensureAnonymousAuth,
  submitReservation,
  subscribeReservation,
  updateReservationHeardFrom,
  type BookingForm,
} from '../lib/reservations';
import { trackAppointmentScheduled, trackPurchaseOnce } from '../lib/analytics';
import { reportError } from '../lib/errorReport';
import { fetchCompanyById, patchCompanyInSessionCache } from '../lib/companies';
import { assertHourlyCapacityAvailable } from '../lib/hourlyCapacityFirestore';
import { bookingPolicyMessage, checkBookingPolicy } from '../utils/bookingPolicy';
import {
  bookingWindowMessage,
  checkBookingTimes,
  checkBookingWindow,
  maxArrivalYmd,
  maxDepartureYmd,
} from '../utils/bookingWindow';
import { APP_CONFIG } from '../constants/appConfig';
import { flightNumberHint } from '../constants/airlines';
import { formatDateDisplay, formatStayPhrase, todayYmd } from '../utils/dates';
import { cn } from '../utils/cn';
import { getPriceBreakdown, withAffiliateDiscount } from '../utils/pricing';
import { useAffiliateOffer } from '../context/AffiliateContext';
import { isAirpickPartner } from '../utils/compareSort';
import AirportSavingsLine from './AirportSavingsLine';
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
import { companyDropFee, findParkingProduct, valetHandoffTitle } from '../utils/parkingProducts';
import { maxPointSpend, POINT_STEP_WON, subscribePointBalance } from '../lib/points';
import { handoffPlaceLine, pickupPin } from '../data/pickupPins';
import { itchaHandoffPlace } from '../data/itchaPickup';
import {
  isSavedBookerName,
  memberHasFrequentInfo,
  readMember,
  rememberMemberReservation,
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
  formatMarketingResultLine,
  readMarketingConsent,
  setMarketingConsent,
} from '../lib/marketingConsent';
import {
  signInWithKakao,
  socialLoginErrorMessage,
  type SocialProviderId,
} from '../lib/socialAuth';
import { portoneCustomerEmail, requestPortoneCardPayment } from '../lib/portonePayment';
import { PRICE_INCLUSION } from '../constants/marketing';
import { isPaymentStepVisible, isTestPaymentMode, savePaySummary } from '../lib/paymentMode';

const FIELD_CLASS =
  'w-full rounded-lg border border-[#d8dee8] bg-white px-3 py-3 text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-[#b0b6c0] focus:border-brand';

const HEARD_FROM_OPTIONS = [
  '네이버 검색',
  '네이버 광고',
  '유튜브',
  '블로그·카페',
  'ChatGPT 등 AI',
  'AI 비서가 대신 예약(피클 등)',
  '지인 추천',
  '입점업체 소개',
  '기타',
] as const;

function draftFor(companyId: string) {
  const draft = readBookingDraft();
  return draft?.companyId === companyId ? draft : null;
}

const bookingShell =
  'fixed inset-x-0 top-[var(--app-header-h,60px)] bottom-[var(--app-tab-h,56px)] z-[80] flex justify-center bg-[#f2f3f5]';

function SectionHead({ children }: { children: string }) {
  return (
    <h3 className="mb-3 text-[17px] font-bold text-ink">
      {children}
      <span className="mt-1.5 block h-[3px] w-9 rounded-full bg-brand" aria-hidden />
    </h3>
  );
}

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
  onBooked,
  onBrowseOtherCompanies,
}: {
  company: Company;
  search: BookingSearch;
  price: number;
  onClose: () => void;
  onDismiss: () => void;
  onSuccess: (reservationId: string) => void;
  /** 접수가 저장된 순간. 닫기를 눌러도 홈에서 이 예약을 보여 준다. */
  onBooked?: (reservationId: string) => void;
  /** 만차 시 다른 업체 비교로 이동 */
  onBrowseOtherCompanies?: () => void;
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
  const asMemberRef = useRef(Boolean(readMember()));
  const [memberPreview, setMemberPreview] = useState(() => Boolean(readMember()));
  const [pointBalance, setPointBalance] = useState(0);
  const [pointSpend, setPointSpend] = useState(0);
  const [pendingProvider, setPendingProvider] = useState<SocialProviderId | null>(null);
  const [pendingUid, setPendingUid] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  /** 마케팅은 빈 칸이 기본. 회원은 서버 값으로 맞춘다. */
  const [marketingOptIn, setMarketingOptIn] = useState(() => {
    const loggedIn = readMember();
    if (loggedIn?.uid && loggedIn.provider === 'kakao') {
      return loggedIn.marketingOptIn === true;
    }
    const draft = draftFor(company.id);
    if (draft && typeof draft.marketingOptIn === 'boolean') return draft.marketingOptIn;
    return false;
  });
  const [marketingTouched, setMarketingTouched] = useState(false);
  const marketingTouchedRef = useRef(false);
  const [heardFromSaved, setHeardFromSaved] = useState<string | null>(null);
  const [heardFromBusy, setHeardFromBusy] = useState(false);
  const [heardFromError, setHeardFromError] = useState('');
  const [heardFromOtherOpen, setHeardFromOtherOpen] = useState(false);
  const [heardFromOther, setHeardFromOther] = useState('');
  const [confirming, setConfirming] = useState(() => draftFor(company.id)?.confirmed === true);
  const [guestMode, setGuestMode] = useState(false);
  /** 일정이 이미 지난 시간이면 일정 수정 칸을 열어 둔다 */
  const [editSchedule, setEditSchedule] = useState(() => !checkBookingTimes(search).ok);
  const [showOptionalNotes, setShowOptionalNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const paymentStepOn = isPaymentStepVisible();
  const [error, setError] = useState('');
  const [soldOut, setSoldOut] = useState(false);
  const [soldOutDetail, setSoldOutDetail] = useState('');
  const parkingTypeName = useId();
  const [completedId, setCompletedId] = useState<string | null>(null);
  const [completedBookingNo, setCompletedBookingNo] = useState<string | null>(null);
  const [completedPayable, setCompletedPayable] = useState(0);
  const pendingPointSpendRef = useRef(0);
  const [completedAsMember, setCompletedAsMember] = useState(false);
  const [marketingResultLine, setMarketingResultLine] = useState('');
  const submittingRef = useRef(false);

  const arrivalTerminal = differentArrivalTerminal
    ? (search.arrivalTerminal ?? search.terminal)
    : search.terminal;

  /** 출국·귀국 중 한쪽이라도 T2면 T2 할증 1회 부과 */
  const isT2 = search.terminal === 'T2' || arrivalTerminal === 'T2';

  /** 출국장 핀이면 업체 발렛비를 금액에 포함한다 */
  const valetFee = search.faceToFace ? (companyValetFee(company, search.terminal) ?? 0) : 0;
  const faceToFaceApplied = search.faceToFace === true && valetFee > 0;
  const parkingProduct = findParkingProduct(company, search, search.faceToFace === true);
  /** 비대면 상품일 때만 비대면 추가요금 */
  const dropFee =
    search.faceToFace !== true && parkingProduct ? companyDropFee(company, search.terminal) : 0;
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
      valetFee,
      dropFee
    );
    return withAffiliateDiscount(base, affiliateDiscountWon);
  }, [company, search, isT2, valetFee, dropFee, affiliateDiscountWon]);

  const payableBeforePoints = breakdown.total;
  const pointSpendCap = memberPreview ? maxPointSpend(pointBalance, payableBeforePoints) : 0;
  const pointSpendWon = Math.min(pointSpend, pointSpendCap);
  const payableTotal = Math.max(0, payableBeforePoints - pointSpendWon);

  const today = todayYmd();

  const phoneValid = isValidMobilePhone(form.phone);
  const carNumberValid = isLikelyCarNumber(form.carNumber);

  const timeCheck = checkBookingTimes(search);
  /** 입고까지 24시간 미만 — 예약 즉시 무료 취소 기간이 지난 상태 */
  const insideCancelWindow = timeCheck.ok && timeCheck.hoursUntilCheckIn < DEFAULT_CANCEL_CUTOFF_HOURS;

  const canSubmit =
    timeCheck.ok &&
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
      marketingOptIn: existing?.marketingOptIn === true,
      marketingAgreedAt: existing?.marketingAgreedAt,
      marketingWithdrawnAt: existing?.marketingWithdrawnAt,
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
    const uid = readMember()?.uid;
    if (!uid || readMember()?.provider !== 'kakao') return;
    let cancelled = false;
    void readMarketingConsent(uid)
      .then((consent) => {
        if (cancelled || marketingTouchedRef.current) return;
        setMarketingOptIn(consent.optIn);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

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
      /** 예약 진행 = 약관 동의로 기록 */
      agreedPlatformTerms: true,
      agreedServiceTerms: true,
      agreedPrivacy: true,
      agreedThirdParty: true,
    });
  };

  const openConfirm = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!timeCheck.ok) {
      setError(timeCheck.message);
      return;
    }
    if (!canSubmit) {
      setError('필수 항목을 확인해 주세요.');
      return;
    }
    persistDraft(true);
    setError('');
    setConfirming(true);
  };

  const backToForm = () => {
    persistDraft(false);
    setConfirming(false);
    setPaying(false);
    setError('');
  };

  // TODO(온라인 결제): 지금은 PG 심사용(예약 생성 안 함). 실결제는 `/pay/{reservationId}` + 대기 점유 + 서버 검증.
  const payWithPortone = async () => {
    if (paying || loading) return;
    const payWindow = checkBookingWindow(search.departureDate, search.arrivalDate);
    if (!payWindow.allowed) {
      setError(bookingWindowMessage(payWindow));
      return;
    }
    const payTimeCheck = checkBookingTimes(search);
    if (!payTimeCheck.ok) {
      setError(payTimeCheck.message);
      return;
    }
    const fullName = form.userName.trim();
    const phoneNumber = form.phone.trim();
    if (!fullName || !phoneValid) {
      setError('결제에는 예약자 이름과 휴대폰 번호가 필요합니다.');
      return;
    }
    if (!memberPreview && !/^\d{4}$/.test(form.reservationPassword.trim())) {
      setError('비회원 비밀번호 4자리를 입력해 주세요.');
      return;
    }
    const amount = memberPreview ? payableTotal : breakdown.total;
    const companyLabel = displayCompanyName(company.name);
    const productLabel = /주차대행|발렛/.test(companyLabel) ? companyLabel : `${companyLabel} 주차대행`;
    const orderName = productLabel;
    setPaying(true);
    setError('');
    try {
      const { auth } = await import('../firebase');
      const memberEmail = auth.currentUser?.email ?? null;
      const { paymentId } = await requestPortoneCardPayment({
        totalAmount: amount,
        orderName,
        onBeforeRequest: (id) =>
          savePaySummary({
            paymentId: id,
            orderName,
            amount,
            companyName: companyLabel,
            schedule: `${formatDateDisplay(search.departureDate)} ${search.departureTime} → ${formatDateDisplay(search.arrivalDate)} ${search.arrivalTime}`,
          }),
        fullName,
        phoneNumber,
        email: portoneCustomerEmail({ memberEmail, phone: phoneNumber }),
      });
      window.location.assign(`/payment/complete?paymentId=${encodeURIComponent(paymentId)}`);
    } catch (err) {
      console.error('[portone]', err);
      const message = err instanceof Error ? err.message : '결제에 실패했습니다.';
      window.alert(message);
      setError(message);
    } finally {
      setPaying(false);
    }
  };

  const placeReservation = async (asMember: boolean) => {
    if (submittingRef.current) return;

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
    const payable = breakdown.total;
    const spend = asMember ? Math.min(pointSpend, maxPointSpend(pointBalance, payable)) : 0;

    submittingRef.current = true;
    asMemberRef.current = asMember;
    setLoading(true);
    setError('');
    setSoldOut(false);
    setSoldOutDetail('');
    try {
      const latestCompany = (await fetchCompanyById(company.id)) ?? company;
      if (latestCompany !== company) {
        patchCompanyInSessionCache(latestCompany);
      }

      const windowCheck = checkBookingWindow(payload.departureDate, payload.arrivalDate);
      if (!windowCheck.allowed) {
        setError(bookingWindowMessage(windowCheck));
        return;
      }
      const placeTimeCheck = checkBookingTimes(payload);
      if (!placeTimeCheck.ok) {
        setError(placeTimeCheck.message);
        return;
      }

      const localCheck = checkBookingPolicy(
        payload.departureDate,
        payload.arrivalDate,
        latestCompany.isOpen !== false,
        latestCompany.blockedDates ?? [],
        latestCompany.sameDayBookingBlocked === true
      );
      if (!localCheck.allowed) {
        setError(bookingPolicyMessage(localCheck, payload.departureDate, payload.arrivalDate));
        return;
      }

      try {
        await ensureAnonymousAuth();
        await assertHourlyCapacityAvailable(
          latestCompany.id,
          payload.departureDate,
          payload.departureTime,
          {
            hourlyCapEnabled: latestCompany.hourlyCapEnabled,
            maxCarsPerHour: latestCompany.maxCarsPerHour,
          }
        );
      } catch (capErr) {
        const detail =
          capErr instanceof Error ? capErr.message : '해당 시간대 예약이 마감되었습니다.';
        setSoldOut(true);
        setSoldOutDetail(detail);
        setError('');
        return;
      }

      const { id, bookingNo } = await submitReservation(
        latestCompany.id,
        latestCompany.name,
        payload,
        bookingForm,
        payable,
        search.faceToFace === true ? { valetFee } : undefined,
        affiliateOffer && isAirpickPartner(latestCompany)
          ? {
              code: affiliateOffer.code,
              customerDiscountWon: breakdown.affiliateDiscountWon ?? 0,
              referrerCreditWon: affiliateOffer.referrerCreditWon,
            }
          : undefined,
        marketingOptIn,
        spend,
        parkingProduct ? { id: parkingProduct.id, dropFee } : undefined,
        {
          listPrice: breakdown.total,
        }
      );
      trackAppointmentScheduled();
      trackPurchaseOnce({
        transactionId: id,
        value: Math.max(0, payable - spend),
        vendor: company.id,
        vendorName: company.name,
        bookingPath: 'airpick_main',
        bookingMethod: asMember ? 'kakao' : 'guest',
      });
      saveRecentReservation({
        id,
        carNumber: form.carNumber.trim(),
        arrivalDate: payload.arrivalDate,
      });
      let resultLine = '';
      if (asMember) {
        const next = rememberMemberReservation(id, form.carNumber.trim());
        if (next?.uid) {
          try {
            await saveKakaoMember(next);
            if (marketingTouched) {
              const result = await setMarketingConsent(marketingOptIn, 'booking');
              resultLine = formatMarketingResultLine(result.agree, result.at);
            }
          } catch {
            /* 회원·동의 저장 실패는 예약 접수를 막지 않는다 */
          }
        }
      } else if (marketingTouched && marketingOptIn) {
        resultLine = formatMarketingResultLine(true, new Date().toISOString());
      }
      clearBookingDraft();
      pendingPointSpendRef.current = spend;
      setCompletedPayable(Math.max(0, payable - spend));
      setCompletedAsMember(asMember);
      setMarketingResultLine(resultLine);
      setForm((prev) => ({ ...prev, reservationPassword: password }));
      setCompletedBookingNo(bookingNo);
      setCompletedId(id);
      onBooked?.(id);
    } catch (err) {
      console.error(err);
      reportError('error', err, '예약 저장');
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

  if (soldOut) {
    const canFlipOutdoor = companySupportsOutdoor(company) && search.isIndoor;
    const canFlipIndoor = companySupportsIndoor(company) && !search.isIndoor;
    return (
      <div className={bookingShell}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-soldout-title"
          className="h-full w-full max-w-lg overflow-y-auto bg-white px-6 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-left"
        >
          <h2 id="booking-soldout-title" className="text-xl font-bold text-ink">
            만차입니다
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-muted">
            {displayCompanyName(company.name)} ·{' '}
            {formatDateDisplay(search.departureDate)} {search.departureTime} ·{' '}
            {parkingTypeLabel(search.isIndoor)}
          </p>
          {soldOutDetail ? (
            <p className="mt-2 text-[13px] font-medium text-muted">{soldOutDetail}</p>
          ) : null}
          <p className="mt-4 text-sm font-bold text-ink">대안을 골라 주세요</p>
          <ul className="mt-3 space-y-2">
            {onBrowseOtherCompanies ? (
              <li>
                <button
                  type="button"
                  onClick={onBrowseOtherCompanies}
                  className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white hover:bg-brand-dark"
                >
                  다른 업체 보기
                </button>
              </li>
            ) : null}
            {canFlipOutdoor || canFlipIndoor ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSearch((prev) => ({ ...prev, isIndoor: !prev.isIndoor }));
                    setSoldOut(false);
                    setSoldOutDetail('');
                    setEditSchedule(true);
                  }}
                  className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-ink ring-1 ring-[#0f1a2e]/12"
                >
                  {canFlipOutdoor ? '야외 보관으로 바꿔 보기' : '실내 보관으로 바꿔 보기'}
                </button>
              </li>
            ) : null}
            <li>
              <button
                type="button"
                onClick={() => {
                  setSoldOut(false);
                  setSoldOutDetail('');
                  setEditSchedule(true);
                  setConfirming(false);
                }}
                className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-ink ring-1 ring-[#0f1a2e]/12"
              >
                날짜·시간 바꾸기
              </button>
            </li>
          </ul>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full py-2 text-sm font-semibold text-muted"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

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
            예약이 확정되었습니다
          </h2>
          <p className="mt-1.5 text-sm font-medium text-muted">
            {displayCompanyName(company.name)} · {formatStayPhrase(breakdown.days)} 주차
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">
            카카오 알림톡으로 예약 내역을 보내드려요.
          </p>
          {marketingResultLine ? (
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-muted">
              {marketingResultLine}
            </p>
          ) : null}

          <dl className="mt-5 space-y-2.5 rounded-2xl bg-[#f4f5f7] p-4 text-left">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">예약번호</dt>
              <dd className="font-mono text-sm font-bold text-ink break-all text-right">
                {completedBookingNo || completedId}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">업체명</dt>
              <dd className="text-sm font-bold text-ink text-right">
                {displayCompanyName(company.name)}
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
              <dt className="shrink-0 text-[13px] font-semibold text-muted">인계</dt>
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
                <dt className="text-[13px] font-semibold text-muted">Curbside</dt>
                <dd className="text-sm font-bold text-brand">
                  +{valetFee.toLocaleString()}원
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

          <div className="mt-4 rounded-2xl bg-brand/5 p-4 text-left ring-1 ring-brand/15">
            <p className="text-sm font-bold text-ink">조회 방법</p>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-muted">
              {completedAsMember ? (
                <>
                  <span className="font-bold text-ink">예약 탭</span>에서 카카오 로그인 후 내 예약을
                  확인하거나, 차량번호·비밀번호 4자리로 비회원 조회할 수 있어요.
                </>
              ) : (
                <>
                  입력하신 4자리 비밀번호
                  <span className="mx-1 rounded-md bg-white px-2 py-0.5 font-mono text-sm font-bold tracking-widest text-brand ring-1 ring-brand/20">
                    {form.reservationPassword}
                  </span>
                  는 <span className="font-bold text-ink">예약 탭</span>에서 차량번호와 함께 입력해야
                  입고 위치·사진을 확인할 수 있어요.
                </>
              )}
            </p>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-muted">
              예약번호로도 조회할 수 있어요.
            </p>
          </div>

          {!heardFromSaved ? (
            <div className="mt-4 rounded-2xl bg-[#f4f5f7] p-4 text-left">
              <p className="text-sm font-bold text-ink">에어픽을 어떻게 알게 되셨나요? (선택)</p>
              <p className="mt-1 text-[12px] font-medium text-muted">한 번 탭하면 저장됩니다.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {HEARD_FROM_OPTIONS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    disabled={heardFromBusy}
                    onClick={async () => {
                      if (label === '기타') {
                        setHeardFromOtherOpen(true);
                        setHeardFromError('');
                        return;
                      }
                      setHeardFromBusy(true);
                      setHeardFromError('');
                      try {
                        await updateReservationHeardFrom(completedId, label);
                        setHeardFromSaved(label);
                        setHeardFromOtherOpen(false);
                      } catch {
                        setHeardFromError('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                      } finally {
                        setHeardFromBusy(false);
                      }
                    }}
                    className={cn(
                      'rounded-full bg-white px-3 py-2 text-[12px] font-bold text-ink ring-1 ring-[#0f1a2e]/12 transition active:scale-[0.98] disabled:opacity-60',
                      heardFromOtherOpen && label === '기타' && 'ring-2 ring-brand'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {heardFromOtherOpen ? (
                <div className="mt-3 flex gap-2">
                  <input
                    value={heardFromOther}
                    onChange={(e) => setHeardFromOther(e.target.value)}
                    placeholder="직접 입력"
                    maxLength={60}
                    className={`${FIELD_CLASS} flex-1 py-2.5`}
                  />
                  <button
                    type="button"
                    disabled={heardFromBusy || !heardFromOther.trim()}
                    onClick={async () => {
                      const value = `기타: ${heardFromOther.trim().slice(0, 60)}`;
                      setHeardFromBusy(true);
                      setHeardFromError('');
                      try {
                        await updateReservationHeardFrom(completedId, value);
                        setHeardFromSaved(value);
                        setHeardFromOtherOpen(false);
                      } catch {
                        setHeardFromError('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                      } finally {
                        setHeardFromBusy(false);
                      }
                    }}
                    className="shrink-0 rounded-lg bg-[#0f1a2e] px-3 py-2.5 text-[12px] font-bold text-white disabled:opacity-60"
                  >
                    저장
                  </button>
                </div>
              ) : null}
              {heardFromError ? (
                <p className="mt-2 text-[12px] font-semibold text-rose-500">{heardFromError}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-[13px] font-semibold text-muted">
              유입 경로 · {heardFromSaved}
            </p>
          )}

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
    const shownPayable = memberPreview ? payableTotal : guestPayable;
    const paymentSection = (
            <section aria-labelledby="booking-pay-title" className="mt-5 rounded-2xl p-4 ring-1 ring-[#0f1a2e]/10">
              <h3 id="booking-pay-title" className="text-[15px] font-bold text-ink">
                결제
              </h3>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="text-[13px] font-semibold text-muted">결제 금액</span>
                <span className="text-lg font-bold text-ink tabular-nums">{shownPayable.toLocaleString()}원</span>
              </div>
              <ul className="mt-3 space-y-1 rounded-xl bg-[#f4f5f7] px-3 py-2.5 text-[12px] font-medium leading-relaxed text-[#0f1a2e]/80">
                <li className={insideCancelWindow ? '' : 'font-bold text-ink'}>
                  · 맡기는 시각 {APP_CONFIG.refund.fullRefundHours}시간 전까지 취소: 전액 환불
                </li>
                <li className={insideCancelWindow ? 'font-bold text-ink' : ''}>
                  · {APP_CONFIG.refund.fullRefundHours}시간 전부터 맡기는 시각 전까지:{' '}
                  {Math.round(APP_CONFIG.refund.lateRefundRatio * 100)}% 환불
                </li>
                <li>· 맡기는 시각 이후(노쇼 포함): 환불 불가</li>
                <li>· {APP_CONFIG.bookingWindowNotice}</li>
              </ul>
              <p className="mt-3 text-[12px] font-medium leading-relaxed text-muted">
                결제하면 위 취소·환불 규정에 동의한 것으로 봅니다.{' '}
                <a href="/refund/" target="_blank" rel="noopener" className="font-semibold text-brand underline-offset-2 hover:underline">
                  전문 보기
                </a>
              </p>
              <button
                type="button"
                disabled={paying || loading || authBusy}
                onClick={() => void payWithPortone()}
                className="mt-3 w-full rounded-xl bg-[#0f1a2e] py-3.5 text-[16px] font-bold text-white transition-opacity disabled:opacity-40"
              >
                {paying ? '결제창 여는 중…' : `${shownPayable.toLocaleString()}원 결제하기`}
              </button>
              {isTestPaymentMode() ? (
                <p className="mt-2 text-center text-[11px] font-medium text-muted">
                  테스트 결제입니다. 실제로 청구되지 않습니다.
                </p>
              ) : null}
            </section>
    );
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
            {paymentStepOn
              ? '확인 후 결제하면 예약이 접수됩니다. 내 예약에서 바로 볼 수 있습니다.'
              : memberPreview
              ? '맞으면 이 금액으로 접수합니다. 내 예약에서 바로 볼 수 있습니다.'
              : '카카오로 접수하면 출고 후 포인트가 적립됩니다. 비회원으로도 접수할 수 있습니다.'}
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
            <AirportSavingsLine
              days={breakdown.days}
              displayPriceWon={shownPayable}
              compact
              className="pt-1 text-right"
            />
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
            paymentStepOn ? (
              paymentSection
            ) : (
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
                  : '이 금액으로 접수'}
            </button>
            )
          ) : (
            <>
              <button
                type="button"
                disabled={loading || authBusy}
                onClick={() => void chooseKakao()}
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] py-3.5 text-[16px] font-bold text-[#191919] disabled:opacity-60"
              >
                <KakaoBubble />
                {authBusy ? '로그인 중…' : '카카오 로그인해서 적립하기'}
              </button>
              {!guestMode ? (
                <button
                  type="button"
                  disabled={loading || authBusy}
                  onClick={() => setGuestMode(true)}
                  className="mt-2 w-full rounded-xl bg-[#f4f5f7] py-3 text-[15px] font-bold text-[#0f1a2e] disabled:opacity-60"
                >
                  {paymentStepOn ? '비회원으로 결제' : '비회원으로 접수'}
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
              {paymentStepOn ? (
                paymentSection
              ) : (
              <button
                type="button"
                disabled={loading || authBusy}
                onClick={() => void placeReservation(false)}
                className="mt-3 w-full rounded-xl bg-brand py-3.5 text-[16px] font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
              >
                {loading && !authBusy ? '접수 중…' : `비회원 접수 · ${guestPayable.toLocaleString()}원`}
              </button>
              )}
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

  const pickupId =
    search.isIndoor || search.pickupPointId === 'depart' || search.faceToFace
      ? 'depart'
      : 'short';
  const pin = pickupPin(search.terminal, pickupId);
  const transferTitle = valetHandoffTitle(pin.meetHandoff);
  const companyName = displayCompanyName(company.name);
  const scheduleLine = `${formatDateDisplay(search.departureDate)} ${search.departureTime} — ${formatDateDisplay(search.arrivalDate)} ${search.arrivalTime}`;
  const lotLabel = parkingTypeLabel(search.isIndoor);

  const summaryCard = (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-[#0f1a2e]/10">
      <p className="text-[12px] font-semibold text-muted">인천공항 · {terminalSummary}</p>
      <p className="mt-0.5 text-[17px] font-bold text-ink">{companyName}</p>
      <ul className="mt-3 space-y-2.5">
        <li className="flex items-start gap-2.5">
          <Calendar size={18} className="mt-0.5 shrink-0 text-ink" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span className="text-[13px] font-semibold leading-snug text-ink tabular-nums">
                {scheduleLine}
              </span>
              <button
                type="button"
                onClick={() => setEditSchedule((v) => !v)}
                className="shrink-0 text-[13px] font-bold text-brand"
              >
                {editSchedule ? '접기' : '수정'}
              </button>
            </span>
            <span className="mt-0.5 block text-[12px] font-medium text-muted">
              {lotLabel} · {formatStayPhrase(breakdown.days)}
            </span>
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Car size={18} className="mt-0.5 shrink-0 text-ink" aria-hidden />
          <span className="min-w-0 flex-1 text-[13px] font-semibold text-ink">
            {transferTitle}
            <span className="mt-0.5 block text-[12px] font-medium text-muted">{pin.detail}</span>
          </span>
          <span className="shrink-0 text-[13px] font-bold tabular-nums text-ink">
            {payableTotal.toLocaleString()}원
          </span>
        </li>
        <li className="flex items-center gap-2.5 text-[13px] font-semibold text-ink">
          <KeyRound size={18} className="shrink-0" aria-hidden />
          {pin.meetHandoff ? '키를 맡깁니다' : '단기주차장에서 키를 맡깁니다'}
        </li>
      </ul>
      {editSchedule ? (
        <div className="mt-3 space-y-3 border-t border-[#0f1a2e]/8 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <DateField
              label="맡기는 날"
              value={search.departureDate}
              min={today}
              max={maxDepartureYmd(today)}
              onChange={(departureDate) => {
                setSearch((prev) => {
                  const next = { ...prev, departureDate };
                  const arrMax = maxArrivalYmd(departureDate);
                  if (next.arrivalDate < departureDate) {
                    next.arrivalDate = departureDate;
                  } else if (next.arrivalDate > arrMax) {
                    next.arrivalDate = arrMax;
                  }
                  return next;
                });
              }}
            />
            <DateField
              label="찾는 날"
              value={search.arrivalDate}
              min={search.departureDate}
              max={maxArrivalYmd(search.departureDate)}
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
          <fieldset>
            <legend className="text-[13px] font-bold text-muted">주차 공간</legend>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(
                [
                  {
                    value: false,
                    label: '야외',
                    disabled: !companySupportsOutdoor(company),
                  },
                  {
                    value: true,
                    label: '실내',
                    disabled: !companySupportsIndoor(company),
                  },
                ] as const
              ).map((opt) => {
                const id = `${parkingTypeName}-${opt.value ? 'indoor' : 'outdoor'}`;
                const selected = search.isIndoor === opt.value;
                return (
                  <label
                    key={id}
                    htmlFor={id}
                    className={cn(
                      'rounded-xl py-2 text-center text-[13px] font-bold transition-colors',
                      opt.disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
                      selected ? 'bg-sky-deep text-brand' : 'bg-sky-soft text-muted'
                    )}
                  >
                    <input
                      id={id}
                      type="radio"
                      name={parkingTypeName}
                      value={opt.value ? 'indoor' : 'outdoor'}
                      checked={selected}
                      disabled={opt.disabled}
                      onChange={() => setSearch((prev) => ({ ...prev, isIndoor: opt.value }))}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      ) : null}
      <div className="mt-3 border-t border-[#0f1a2e]/8 pt-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-muted">{paymentStepOn ? '결제 금액' : '온라인 결제 준비 중'}</span>
          <span className="text-[15px] font-bold tabular-nums text-ink">
            {payableTotal.toLocaleString()}원
          </span>
        </div>
        <AirportSavingsLine
          days={breakdown.days}
          displayPriceWon={payableTotal}
          className="mt-1.5 text-right"
        />
        <p className="mt-1.5 text-[11px] font-medium text-muted">
          {PRICE_INCLUSION.bookingLine}
          {insideCancelWindow ? '' : ` · 입고 ${DEFAULT_CANCEL_CUTOFF_HOURS}시간 전 무료 취소`}
        </p>
      </div>
    </div>
  );

  const cancelNote = !timeCheck.ok ? (
    <p role="alert" className="text-center text-[13px] font-semibold text-rose-600">
      {timeCheck.message}
    </p>
  ) : insideCancelWindow ? null : (
    <p className="text-center text-[13px] font-semibold text-emerald-700">
      입고 {DEFAULT_CANCEL_CUTOFF_HOURS}시간 전까지 무료 취소
    </p>
  );

  const submitBar = (compact: boolean) => (
    <div
      className={cn(
        'flex items-center gap-3 bg-white',
        compact
          ? 'border-t border-[#0f1a2e]/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(15,26,46,0.08)]'
          : 'rounded-b-2xl bg-[#0f1a2e] px-4 py-3'
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[20px] font-bold tabular-nums leading-none',
            compact ? 'text-ink' : 'text-white'
          )}
        >
          {payableTotal.toLocaleString()}원
        </p>
      </div>
      <button
        type="submit"
        form="booking-form"
        className={cn(
          'shrink-0 rounded-lg px-5 py-3.5 text-[15px] font-bold transition active:scale-[0.99]',
          compact ? 'bg-[#0f1a2e] text-white' : 'bg-white text-[#0f1a2e]'
        )}
      >
        예약하기
      </button>
    </div>
  );

  return (
    <div className={bookingShell}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="예약"
        className="flex h-full min-h-0 w-full max-w-lg flex-col md:max-w-5xl md:flex-row md:gap-5 md:px-5 md:py-4"
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 justify-end px-3 pt-1 md:px-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="shrink-0 rounded-full p-2 hover:bg-white/80"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>

          <form
            id="booking-form"
            ref={formRef}
            onSubmit={openConfirm}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 md:px-0"
          >
            <div className="md:hidden">{summaryCard}</div>

            <section className="rounded-2xl bg-white p-4 ring-1 ring-[#0f1a2e]/8">
              <SectionHead>개인 정보</SectionHead>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold text-ink">이름 *</span>
                  <input
                    value={form.userName}
                    onChange={(e) => setFormField('userName', e.target.value)}
                    placeholder="홍길동"
                    className={FIELD_CLASS}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold text-ink">휴대전화 *</span>
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
                      010-1234-5678 형식(숫자 11자리)으로 입력해 주세요.
                    </span>
                  ) : null}
                </label>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-4 ring-1 ring-[#0f1a2e]/8">
              <SectionHead>여행 정보</SectionHead>
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-[13px] font-bold text-muted">출국</p>
                  <div className="grid grid-cols-2 gap-2">
                    <AirlineSelect
                      label="항공사"
                      required
                      value={form.departureAirline}
                      referenceDateYmd={search.departureDate}
                      currentTerminal={search.terminal}
                      onChange={(departureAirline) => setFormField('departureAirline', departureAirline)}
                    />
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-bold text-ink">가는 편명 *</span>
                      <input
                        value={form.departureFlight}
                        onChange={(e) => setFormField('departureFlight', e.target.value.toUpperCase().replace(/\s+/g, ''))}
                        placeholder="KE701"
                        className={FIELD_CLASS}
                      />
                      {flightNumberHint(form.departureAirline, form.departureFlight) ? (
                        <span className="mt-1 block text-[12px] font-semibold leading-snug text-amber-800">
                          {flightNumberHint(form.departureAirline, form.departureFlight)}
                        </span>
                      ) : null}
                    </label>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[13px] font-bold text-muted">귀국</p>
                  <div className="grid grid-cols-2 gap-2">
                    <AirlineSelect
                      label="항공사"
                      required
                      value={form.arrivalAirline}
                      referenceDateYmd={search.arrivalDate}
                      currentTerminal={search.arrivalTerminal ?? search.terminal}
                      onChange={(arrivalAirline) => setFormField('arrivalAirline', arrivalAirline)}
                    />
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-bold text-ink">오는 편명 *</span>
                      <input
                        value={form.arrivalFlight}
                        onChange={(e) => setFormField('arrivalFlight', e.target.value.toUpperCase().replace(/\s+/g, ''))}
                        placeholder="KE702"
                        className={FIELD_CLASS}
                      />
                      {flightNumberHint(form.arrivalAirline, form.arrivalFlight) ? (
                        <span className="mt-1 block text-[12px] font-semibold leading-snug text-amber-800">
                          {flightNumberHint(form.arrivalAirline, form.arrivalFlight)}
                        </span>
                      ) : null}
                    </label>
                  </div>
                  <p className="mt-1.5 text-[12px] font-medium text-muted">
                    항공권 편명으로 맞춥니다. 예: KE701
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-4 ring-1 ring-[#0f1a2e]/8">
              <SectionHead>차량 정보</SectionHead>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold text-ink">차량번호 *</span>
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
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-bold text-ink">제조사 · 모델 *</span>
                  <input
                    value={form.carModel}
                    onChange={(e) => setFormField('carModel', e.target.value)}
                    placeholder="현대 그랜저"
                    className={FIELD_CLASS}
                  />
                </label>
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
                  <div className="space-y-2 border-t border-[#0f1a2e]/8 pt-3">
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-bold text-ink">여행지</span>
                      <input
                        value={form.destination}
                        onChange={(e) => setFormField('destination', e.target.value)}
                        placeholder="오사카, 싱가포르"
                        className={FIELD_CLASS}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-bold text-ink">
                        기사님께 전달할 메시지
                      </span>
                      <textarea
                        value={form.customerNotes}
                        onChange={(e) => setFormField('customerNotes', e.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-lg border border-[#d8dee8] bg-white px-3 py-2 text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-[#b0b6c0] focus:border-brand"
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            </section>

            <div className="rounded-2xl bg-white ring-1 ring-[#0f1a2e]/8">
              <BookingConsent
                marketingOptIn={marketingOptIn}
                onMarketingOptInChange={(value) => {
                  marketingTouchedRef.current = true;
                  setMarketingTouched(true);
                  setMarketingOptIn(value);
                }}
                providerName={companyName}
              />
            </div>
            {error ? (
              <p className="text-center text-[13px] font-semibold text-rose-500">{error}</p>
            ) : null}
          </form>

          <div className="shrink-0 bg-white md:hidden">
            <div className="px-4 pt-2">{cancelNote}</div>
            {submitBar(true)}
          </div>
        </div>

        <aside className="hidden min-h-0 w-[20rem] shrink-0 flex-col overflow-y-auto md:flex lg:w-[22rem]">
          <div className="space-y-3 pt-10 pb-4">
            {summaryCard}
            {cancelNote}
            <div className="overflow-hidden rounded-2xl ring-1 ring-[#0f1a2e]/10">
              {submitBar(false)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
