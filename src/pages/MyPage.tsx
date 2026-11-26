import { ChevronRight, Pencil, User, X } from 'lucide-react';
import {
  clearMember,
  isSavedBookerName,
  memberHasFrequentInfo,
  MEMBER_PLACEHOLDER_NAME,
  readMember,
  saveMember,
  subscribeMember,
  usableKakaoNickname,
} from '../lib/memberSession';
import { applyKakaoLogin, rememberedKakaoMember, saveKakaoMember } from '../lib/members';
import {
  formatMarketingResultLine,
  formatMarketingStatusLine,
  readMarketingConsent,
  setMarketingConsent,
} from '../lib/marketingConsent';
import { subscribeKakaoLoginError, takeKakaoLoginError } from '../lib/bookingDraft';
import {
  markKakaoLoggedOut,
  readSignedInKakaoIdentity,
  socialLoginErrorMessage,
} from '../lib/socialAuth';
import { formatPhoneInput, isValidMobilePhone } from '../utils/contact';
import { cn } from '../utils/cn';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ESIM_GUIDE_TITLE } from '../constants/marketing';
import ReservationCard from '../components/ReservationCard';
import ReservationLookupForm from '../components/ReservationLookupForm';
import { subscribeCompanies } from '../lib/companies';
import {
  cancelReservation,
  fetchReservationById,
  fetchReviewTarget,
  lookupReservations,
  PASSWORD_RATE_LIMIT_MESSAGE,
  PasswordRateLimitedError,
  subscribeReservation,
} from '../lib/reservations';
import { submitCompanyReview } from '../lib/reviews';
import { POINT_STEP_WON, subscribePointBalance } from '../lib/points';
import type { Company, Reservation, ReservationLookupMode, Terminal } from '../types';
import { clearRecentReservation, getRecentReservation } from '../utils/recentReservation';
import { displayCompanyName } from '../utils/display';
import { displayReservationCode } from '../utils/bookingNo';
import { getStatusLabel } from '../utils/trust';
import { todaySeoulYmd, ymdToInputValue } from '../lib/icnFlight';
import { terminalLabel } from '../utils/terminalLabels';

type ReservationBucket = 'active' | 'done' | 'cancelled';

function reservationBucket(status: string): ReservationBucket {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'checked_out' || status === 'completed_out') return 'done';
  if (
    status === 'pending' ||
    status === 'scheduled' ||
    status === 'pending_in' ||
    status === 'checked_in' ||
    status === 'completed_in' ||
    status === 'request_out'
  ) {
    return 'active';
  }
  return 'active';
}

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

function calendarDayDiff(fromYmd: string, toYmd: string): number {
  const [y1, m1, d1] = fromYmd.split('-').map(Number);
  const [y2, m2, d2] = toYmd.split('-').map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.round((b - a) / 86_400_000);
}

function formatMmDd(ymd: string): string {
  const parts = ymd.split('-');
  if (parts.length < 3) return ymd;
  return `${parts[1]}.${parts[2]}`;
}

function weekdayKo(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return '';
  return WEEKDAY_KO[new Date(y, m - 1, d).getDay()] ?? '';
}

function departureDdayBadge(departureDate: string, arrivalDate: string): string {
  const today = ymdToInputValue(todaySeoulYmd()) || todaySeoulYmd();
  const dep = departureDate;
  const arr = arrivalDate;
  if (today < dep) {
    const n = calendarDayDiff(today, dep);
    return `출국 D-${n}`;
  }
  if (today === dep) return '오늘 출국';
  if (today < arr) {
    const n = calendarDayDiff(today, arr);
    return `귀국 D-${n}`;
  }
  if (today === arr) return '오늘 귀국';
  return '';
}

function asTerminal(raw: string | undefined): Terminal {
  return raw === 'T2' ? 'T2' : 'T1';
}

function pickUpcomingReservation(rows: Reservation[]): Reservation | null {
  const today = ymdToInputValue(todaySeoulYmd()) || todaySeoulYmd();
  const active = rows.filter(
    (item) =>
      reservationBucket(item.status) === 'active' && item.arrivalDate >= today
  );
  if (active.length === 0) return null;
  return [...active].sort((a, b) => {
    const byDate = a.departureDate.localeCompare(b.departureDate);
    if (byDate !== 0) return byDate;
    return (a.departureTime || '').localeCompare(b.departureTime || '');
  })[0];
}

function UpcomingReservationCard({
  reservation,
  onOpenDetail,
}: {
  reservation: Reservation;
  onOpenDetail: () => void;
}) {
  const dep = reservation.departureDate;
  const time = (reservation.departureTime || '').slice(0, 5);
  const day = weekdayKo(dep);
  const terminal = terminalLabel(asTerminal(reservation.departureTerminal));
  return (
    <div className="mt-4 rounded-[20px] bg-[#f4f5f7] px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-[#0f1a2e]/55">다가오는 예약</p>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[12px] font-semibold text-[#0f1a2e]">
          {departureDdayBadge(reservation.departureDate, reservation.arrivalDate)}
        </span>
      </div>
      <p className="mt-1 text-[13px] font-semibold text-brand">
        {getStatusLabel(reservation.status)}
      </p>
      <p className="mt-0.5 font-mono text-[12px] font-bold tracking-wide text-[#0f1a2e]/70">
        예약번호 {displayReservationCode(reservation)}
      </p>
      <p className="mt-0.5 text-[16px] font-bold text-[#0f1a2e]">
        {displayCompanyName(reservation.companyName)}
      </p>
      <p className="mt-2 text-[14px] font-semibold tabular-nums text-[#0f1a2e]">
        {formatMmDd(dep)}
        {day ? ` (${day})` : ''}
        {time ? ` ${time}` : ''}
        {` · ${terminal}`}
      </p>
      <p className="mt-0.5 text-[13px] font-medium tabular-nums text-[#0f1a2e]/55">
        귀국 {formatMmDd(reservation.arrivalDate)}
      </p>
      <button
        type="button"
        onClick={onOpenDetail}
        className="mt-3 w-full rounded-xl bg-[#0f1a2e] py-2.5 text-[14px] font-semibold text-white"
      >
        예약 상세 보기
      </button>
    </div>
  );
}

function InfoEditButton({
  editing,
  onEdit,
  onSave,
}: {
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={editing ? (event) => event.preventDefault() : undefined}
      onClick={editing ? onSave : onEdit}
      className="inline-flex items-center gap-1 rounded-full bg-[#F3E6C4] px-3 py-1.5 text-[13px] font-semibold text-[#0f1a2e]"
    >
      {editing ? '저장' : '정보 수정'}
      {editing ? null : <Pencil size={13} strokeWidth={2} />}
    </button>
  );
}

function BookerField({
  label,
  value,
  placeholder,
  editing,
  onChange,
  inputMode,
  divider,
}: {
  label: string;
  value: string;
  placeholder: string;
  editing: boolean;
  onChange: (value: string) => void;
  inputMode?: 'tel' | 'text';
  divider?: boolean;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3 py-3', divider && 'border-t border-[#0f1a2e]/8')}>
      <span className="shrink-0 text-[14px] font-medium text-[#0f1a2e]/55">{label}</span>
      {editing ? (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode={inputMode}
          placeholder={placeholder}
          className="w-full bg-transparent text-right text-[15px] font-semibold text-[#0f1a2e] outline-none placeholder:font-medium placeholder:text-[#b0b6c0]"
        />
      ) : (
        <span className={value.trim() ? 'text-[15px] font-semibold text-[#0f1a2e]' : 'text-[14px] font-medium text-[#0f1a2e]/35'}>
          {value.trim() || placeholder}
        </span>
      )}
    </div>
  );
}

function GuideLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-3.5 text-left"
    >
      <span className="text-[15px] font-semibold text-[#0f1a2e]">{label}</span>
      <ChevronRight size={18} className="shrink-0 text-[#0f1a2e]/35" />
    </button>
  );
}

export default function MyPage({
  lastReservationId,
  reviewReservationId = null,
  onReviewDeepLinkHandled,
  onBookParking,
  onOpenSupport,
  onOpenParkingGuide,
  onOpenCancelGuide,
  onOpenEsimGuide,
}: {
  lastReservationId: string | null;
  /** 출고 알림톡 `/my?review={id}` */
  reviewReservationId?: string | null;
  onReviewDeepLinkHandled?: () => void;
  onBookParking: () => void;
  onOpenSupport?: () => void;
  onOpenParkingGuide?: () => void;
  onOpenCancelGuide?: () => void;
  onOpenEsimGuide?: () => void;
}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [companiesById, setCompaniesById] = useState<Record<string, Company>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [recentCarNumber] = useState(() => getRecentReservation()?.carNumber ?? '');
  const [lookupPassword, setLookupPassword] = useState('');
  const [autoOpenReviewId, setAutoOpenReviewId] = useState<string | null>(null);
  const [reviewLinkHint, setReviewLinkHint] = useState('');
  const [member, setMember] = useState(() => readMember());
  const [pointBalance, setPointBalance] = useState(0);
  const [lookupMode, setLookupMode] = useState<'member' | 'guest'>('guest');
  const [profileName, setProfileName] = useState(() => {
    const current = readMember();
    return current && isSavedBookerName(current.name) ? current.name.trim() : '';
  });
  const [profilePhone, setProfilePhone] = useState(() => readMember()?.phone ?? '');
  const [profileCar, setProfileCar] = useState(() => readMember()?.carNumber ?? '');
  const [profileModel, setProfileModel] = useState(() => readMember()?.carModel ?? '');
  const [editingBooker, setEditingBooker] = useState(false);
  const [bookerError, setBookerError] = useState('');
  const [photoBroken, setPhotoBroken] = useState(false);
  const [guestReservations, setGuestReservations] = useState<Reservation[]>([]);
  const [authBusy, setAuthBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(
    () => readMember()?.marketingOptIn === true
  );
  const [marketingStatus, setMarketingStatus] = useState(() =>
    formatMarketingStatusLine({
      optIn: readMember()?.marketingOptIn === true,
      agreedAt: readMember()?.marketingAgreedAt,
      withdrawnAt: readMember()?.marketingWithdrawnAt,
    })
  );
  const [marketingSaving, setMarketingSaving] = useState(false);
  const [marketingError, setMarketingError] = useState('');
  const [marketingResultLine, setMarketingResultLine] = useState('');
  const marketingResultTitleId = useId();
  const [reservationTab, setReservationTab] = useState<ReservationBucket>('active');
  const [scrollToReservationId, setScrollToReservationId] = useState<string | null>(null);
  const reservationCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const userPickedReservationTabRef = useRef(false);

  useEffect(() => subscribeMember(() => setMember(readMember())), []);

  useEffect(() => {
    const uid = member?.uid;
    if (!uid) {
      setMarketingOptIn(false);
      setMarketingStatus('받지 않음');
      setMarketingError('');
      return;
    }
    let cancelled = false;
    void readMarketingConsent(uid)
      .then((consent) => {
        if (cancelled) return;
        setMarketingOptIn(consent.optIn);
        setMarketingStatus(formatMarketingStatusLine(consent));
        setMarketingError('');
      })
      .catch(() => {
        if (cancelled) return;
        const local = readMember();
        const consent = {
          optIn: local?.marketingOptIn === true,
          agreedAt: local?.marketingAgreedAt,
          withdrawnAt: local?.marketingWithdrawnAt,
        };
        setMarketingOptIn(consent.optIn);
        setMarketingStatus(formatMarketingStatusLine(consent));
      });
    return () => {
      cancelled = true;
    };
  }, [member?.uid]);

  const onToggleMarketing = async () => {
    if (!member?.uid || marketingSaving) return;
    const next = !marketingOptIn;
    const prevOptIn = marketingOptIn;
    const prevStatus = marketingStatus;
    setMarketingOptIn(next);
    setMarketingSaving(true);
    setMarketingError('');
    try {
      const result = await setMarketingConsent(next, 'mypage');
      const consent = await readMarketingConsent(member.uid).catch(() => ({
        optIn: result.agree,
        agreedAt: result.agree ? result.at : undefined,
        withdrawnAt: result.agree ? undefined : result.at,
      }));
      setMarketingOptIn(consent.optIn);
      setMarketingStatus(formatMarketingStatusLine(consent));
      setMarketingResultLine(formatMarketingResultLine(result.agree, result.at));
    } catch {
      setMarketingOptIn(prevOptIn);
      setMarketingStatus(prevStatus);
      setMarketingError('저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setMarketingSaving(false);
    }
  };
  useEffect(() => {
    if (!member?.uid) {
      setPointBalance(0);
      return;
    }
    return subscribePointBalance(member.uid, setPointBalance);
  }, [member?.uid]);
  useEffect(() => {
    const current = readMember();
    if (!current?.uid || memberHasFrequentInfo(current)) return;
    let cancelled = false;
    void rememberedKakaoMember(current.uid, current).then((restored) => {
      if (cancelled || !restored || !memberHasFrequentInfo(restored)) return;
      const latest = readMember();
      if (!latest || latest.uid !== current.uid || memberHasFrequentInfo(latest)) return;
      saveMember({
        ...restored,
        nickname: latest.nickname || restored.nickname,
        photoUrl: latest.photoUrl || restored.photoUrl,
      });
      setMember(readMember());
    });
    return () => {
      cancelled = true;
    };
  }, [member?.uid]);
  useEffect(() => {
    let cancelled = false;
    void readSignedInKakaoIdentity().then((identity) => {
      if (cancelled || !identity) return;
      const existing = readMember();
      if (!existing) return;
      const nickname = identity.nickname || existing.nickname;
      const photoUrl = identity.photoUrl || existing.photoUrl;
      if (nickname === existing.nickname && photoUrl === existing.photoUrl) return;
      saveMember({ ...existing, nickname, photoUrl });
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    setPhotoBroken(false);
  }, [member?.photoUrl]);
  const bookerKey = member
    ? `${member.name}|${member.phone}|${member.carModel ?? ''}|${member.carNumber}|${member.frequentSaved ? 1 : 0}`
    : '';
  useEffect(() => {
    if (!member) return;
    setProfileName(isSavedBookerName(member.name) ? member.name.trim() : '');
    setProfilePhone(member.phone);
    setProfileModel(member.carModel ?? '');
    setProfileCar(member.carNumber);
  }, [bookerKey]);
  useEffect(() => {
    const pending = takeKakaoLoginError();
    if (pending && !pending.includes('닉네임이 오지 않았습니다')) setLoginError(pending);
    return subscribeKakaoLoginError(setLoginError);
  }, []);
  const reviewDeepLinkHandledRef = useRef<string | null>(null);

  const handleCancel = async (reservation: Reservation, password: string) => {
    await cancelReservation(reservation.id, password);
    const markCancelled = (prev: Reservation[]) =>
      prev.map((r) => (r.id === reservation.id ? { ...r, status: 'cancelled' } : r));
    setReservations(markCancelled);
    setGuestReservations(markCancelled);
    if (getRecentReservation()?.id === reservation.id) clearRecentReservation();
  };

  const handleSubmitReview = async (
    reservation: Reservation,
    password: string,
    rating: number,
    body: string,
    photoDataUrls: string[]
  ) => {
    const asMember = Boolean(member?.uid && reservation.userId && reservation.userId === member.uid);
    await submitCompanyReview(reservation.id, password, rating, body, photoDataUrls, asMember);
    setReservations((prev) =>
      prev.map((r) => (r.id === reservation.id ? { ...r, hasReview: true } : r))
    );
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

  useEffect(() => {
    const ids = member?.reservationIds ?? [];
    if (ids.length === 0) return;
    let cancelled = false;
    void Promise.all(ids.map((id) => fetchReservationById(id))).then((rows) => {
      if (cancelled) return;
      const found = rows.filter((row): row is Reservation => Boolean(row));
      if (found.length === 0) return;
      setReservations((prev) => {
        const known = new Set(prev.map((item) => item.id));
        return [...found.filter((item) => !known.has(item.id)), ...prev];
      });
    });
    return () => {
      cancelled = true;
    };
  }, [member?.reservationIds.join('|')]);

  const companyMap = companiesById;

  useEffect(() => {
    void loadLastReservation();
  }, [loadLastReservation]);

  useEffect(() => {
    if (!reviewReservationId) return;
    if (reviewDeepLinkHandledRef.current === reviewReservationId) return;
    reviewDeepLinkHandledRef.current = reviewReservationId;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      setReviewLinkHint('');
      try {
        // 다른 브라우저(카카오톡 안 등)에서 열면 문서 직접 읽기는 막혀 있다 → 가린 정보로 후기 카드만 띄운다
        const target =
          (await fetchReservationById(reviewReservationId)) ??
          (await fetchReviewTarget(reviewReservationId));
        if (cancelled) return;
        if (!target) {
          setReviewLinkHint('예약을 찾지 못했습니다. 아래에서 차량번호와 비밀번호로 조회해 주세요.');
          onReviewDeepLinkHandled?.();
          return;
        }
        setReservations((prev) => {
          if (prev.some((r) => r.id === target.id)) {
            return prev.map((r) => (r.id === target.id ? { ...r, ...target } : r));
          }
          return [target, ...prev];
        });
        setAutoOpenReviewId(target.id);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setReviewLinkHint('후기 링크를 열지 못했습니다. 아래에서 예약을 조회한 뒤 후기를 작성해 주세요.');
          onReviewDeepLinkHandled?.();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reviewReservationId, onReviewDeepLinkHandled]);

  useEffect(() => {
    const ids = [...reservations, ...guestReservations].map((r) => r.id).filter(Boolean);
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return;

    const apply = (updated: Reservation) => (prev: Reservation[]) =>
      prev.map((r) =>
        r.id === updated.id
          ? { ...updated, hasReview: r.hasReview === true || updated.hasReview === true }
          : r
      );

    const unsubs = uniqueIds.map((id) =>
      subscribeReservation(id, (updated) => {
        if (!updated) return;
        setReservations(apply(updated));
        setGuestReservations(apply(updated));
      })
    );

    return () => unsubs.forEach((unsub) => unsub());
  }, [[...reservations, ...guestReservations].map((r) => r.id).join('|')]);

  const handleLookup = async (mode: ReservationLookupMode, value: string, password: string) => {
    setLoading(true);
    setError('');
    setSearched(true);
    setLookupPassword(password);
    try {
      const list = await lookupReservations(mode, value, password);
      setGuestReservations(list);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof PasswordRateLimitedError
          ? PASSWORD_RATE_LIMIT_MESSAGE
          : '예약 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      );
      setGuestReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    markKakaoLoggedOut();
    clearMember();
    void import('../firebase').then(async ({ auth }) => {
      const leavingUid = auth.currentUser?.uid;
      const { signOut } = await import('firebase/auth');
      if (!leavingUid || auth.currentUser?.uid !== leavingUid || auth.currentUser.isAnonymous) return;
      await signOut(auth);
    });
  };

  const startKakaoLogin = async () => {
    setAuthBusy(true);
    setLoginError('');
    try {
      const session = await applyKakaoLogin();
      setMember(session);
      setGuestReservations([]);
      setSearched(false);
      setError('');
    } catch (err) {
      console.error('kakao login failed', err);
      setLoginError(socialLoginErrorMessage(err) || '로그인에 실패했습니다.');
    } finally {
      setAuthBusy(false);
    }
  };

  const memberRows = reservations.filter((item) =>
    (member?.reservationIds ?? []).includes(item.id)
  );
  const activeMemberRows = memberRows.filter((item) => reservationBucket(item.status) === 'active');
  const doneMemberRows = memberRows.filter((item) => reservationBucket(item.status) === 'done');
  const cancelledMemberRows = memberRows.filter(
    (item) => reservationBucket(item.status) === 'cancelled'
  );
  const activeCount = activeMemberRows.length;
  const doneCount = doneMemberRows.length;
  const cancelledCount = cancelledMemberRows.length;
  const upcomingReservation = member ? pickUpcomingReservation(memberRows) : null;

  const sortGuestReservations = (rows: Reservation[]) =>
    [...rows].sort((a, b) => {
      const rank = (status: string) => (status === 'cancelled' ? 1 : 0);
      return rank(a.status) - rank(b.status);
    });
  const sortTabReservations = (rows: Reservation[], tab: ReservationBucket) => {
    if (tab === 'active') {
      return [...rows].sort((a, b) => {
        const byDate = a.departureDate.localeCompare(b.departureDate);
        if (byDate !== 0) return byDate;
        return (a.departureTime || '').localeCompare(b.departureTime || '');
      });
    }
    if (tab === 'done') {
      return [...rows].sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate));
    }
    return rows;
  };
  const memberTabRows = sortTabReservations(
    reservationTab === 'active'
      ? activeMemberRows
      : reservationTab === 'done'
        ? doneMemberRows
        : cancelledMemberRows,
    reservationTab
  );
  const visibleReservations = (() => {
    if (member) return memberTabRows;
    const merged: Reservation[] = searched ? [...guestReservations] : [];
    if (!searched && lastReservationId) {
      const justBooked = reservations.find((item) => item.id === lastReservationId);
      if (justBooked && !merged.some((item) => item.id === justBooked.id)) merged.unshift(justBooked);
    }
    if (autoOpenReviewId) {
      const review = reservations.find((item) => item.id === autoOpenReviewId);
      if (review && !merged.some((item) => item.id === review.id)) merged.unshift(review);
    }
    return merged;
  })();
  const displayName = member ? usableKakaoNickname(member.nickname) : '';
  const greetingName = isSavedBookerName(profileName) ? profileName.trim() : displayName;
  const listedReservations = member
    ? memberTabRows
    : sortGuestReservations(visibleReservations);
  const tabCount =
    reservationTab === 'active'
      ? activeCount
      : reservationTab === 'done'
        ? doneCount
        : cancelledCount;

  useEffect(() => {
    if (!member) {
      userPickedReservationTabRef.current = false;
      return;
    }
    if (autoOpenReviewId) {
      const target =
        memberRows.find((item) => item.id === autoOpenReviewId) ||
        reservations.find((item) => item.id === autoOpenReviewId);
      if (target) {
        setReservationTab(reservationBucket(target.status));
        return;
      }
    }
    if (userPickedReservationTabRef.current) return;
    setReservationTab(activeCount >= 1 ? 'active' : doneCount >= 1 ? 'done' : 'active');
  }, [member, autoOpenReviewId, activeCount, doneCount, memberRows, reservations]);

  useEffect(() => {
    if (!scrollToReservationId) return;
    const el = reservationCardRefs.current[scrollToReservationId];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setScrollToReservationId(null);
  }, [scrollToReservationId, reservationTab, listedReservations]);

  const bookerReady =
    isSavedBookerName(profileName) &&
    isValidMobilePhone(profilePhone) &&
    Boolean(profileModel.trim()) &&
    Boolean(profileCar.trim());
  const showBookerFields = !bookerReady || editingBooker;
  const guideRows = [
    { key: 'how', label: '이용 방법', onClick: () => onOpenParkingGuide?.() },
    { key: 'cancel', label: '취소·변경 안내', onClick: () => onOpenCancelGuide?.() },
    ...(onOpenSupport ? [{ key: 'faq', label: '자주 묻는 질문', onClick: onOpenSupport }] : []),
  ];
  const moreRows = [{ key: 'esim', label: ESIM_GUIDE_TITLE, onClick: () => onOpenEsimGuide?.() }];
  const reservationSectionRef = useRef<HTMLElement>(null);
  const saveBooker = async () => {
    const current = readMember();
    if (!current) return;
    const phone = formatPhoneInput(profilePhone);
    const name = profileName.trim();
    const car = profileCar.trim();
    const model = profileModel.trim();
    const next = {
      ...current,
      name: isSavedBookerName(name) ? name : MEMBER_PLACEHOLDER_NAME,
      phone: isValidMobilePhone(phone) ? phone : '',
      carModel: model,
      carNumber: car,
      frequentSaved: Boolean(isSavedBookerName(name) || isValidMobilePhone(phone) || model || car),
    };
    setBookerError('');
    try {
      await saveKakaoMember(next);
      setMember(readMember() ?? next);
      setEditingBooker(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setBookerError(
        message.includes('다시 로그인')
          ? message
          : '계정에 저장하지 못했습니다. 다시 눌러 주세요.'
      );
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {member ? (
        <>
          <div className="pt-3">
            <div className="flex items-center gap-3">
              {member.photoUrl && !photoBroken ? (
                <img
                  src={member.photoUrl}
                  alt=""
                  onError={() => setPhotoBroken(true)}
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F3E6C4] text-[20px] font-bold text-[#0f1a2e]">
                  {greetingName ? greetingName.slice(0, 1) : <User size={26} strokeWidth={1.75} />}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[20px] font-bold leading-tight text-[#0f1a2e]">
                  {greetingName ? `${greetingName}님` : '카카오 회원'}
                </h1>
              </div>
              <button
                type="button"
                onClick={logout}
                className="shrink-0 text-[13px] font-medium text-[#0f1a2e]/45"
              >
                로그아웃
              </button>
            </div>
            {upcomingReservation ? (
              <UpcomingReservationCard
                reservation={upcomingReservation}
                onOpenDetail={() => {
                  setReservationTab('active');
                  setScrollToReservationId(upcomingReservation.id);
                  reservationSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
              />
            ) : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-[#f4f5f7] px-4 py-3">
                <p className="text-[13px] font-medium text-[#0f1a2e]/55">포인트</p>
                <p className="mt-1 text-[18px] font-bold tabular-nums text-[#0f1a2e]">
                  {pointBalance.toLocaleString()}원
                </p>
                <p className="mt-0.5 text-[12px] font-medium leading-snug text-[#0f1a2e]/55">
                  {pointBalance >= POINT_STEP_WON
                    ? '다음 예약에서 5,000원 단위로 사용'
                    : '출고 완료 후 이용 금액의 5%'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReservationTab('active');
                  reservationSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
                className="rounded-2xl bg-[#f4f5f7] px-4 py-3 text-left"
              >
                <p className="text-[13px] font-medium text-[#0f1a2e]/55">진행 중</p>
                <p className="mt-1 text-[18px] font-bold tabular-nums text-[#0f1a2e]">
                  {activeCount}건
                </p>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <section className="rounded-2xl bg-[#f4f5f7] p-5">
            <p className="text-[13px] font-medium text-gold">예약 조회</p>
            <h1 className="mt-1 text-[16px] font-bold leading-tight text-[#0f1a2e]">내 예약 확인</h1>
            <p className="mt-1 text-[14px] font-medium text-[#0f1a2e]/55">
              예약번호 · 차량번호 · 카카오 로그인으로 찾습니다.
            </p>
          </section>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'member' as const, label: '카카오 로그인' },
                { id: 'guest' as const, label: '비회원 조회' },
              ]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLookupMode(item.id)}
                className={cn(
                  'rounded-2xl py-3 text-[15px] font-semibold',
                  lookupMode === item.id ? 'bg-[#0f1a2e] text-white' : 'bg-[#f4f5f7] text-[#0f1a2e]'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          {lookupMode === 'member' ? (
            <section className="rounded-2xl bg-[#f4f5f7] p-4">
              <button
                type="button"
                disabled={authBusy}
                onClick={() => void startKakaoLogin()}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] py-3.5 text-[16px] font-bold text-[#191919] disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0">
                  <path
                    fill="currentColor"
                    d="M12 3C6.5 3 2 6.6 2 11.1c0 2.9 1.9 5.4 4.8 6.8-.2.7-1.1 4-1.1 4.1 0 .2.2.3.3.2.2 0 3.5-2.3 4.1-2.7.6.1 1.3.2 1.9.2 5.5 0 10-3.6 10-8.1S17.5 3 12 3z"
                  />
                </svg>
                {authBusy ? '로그인 중…' : '카카오 로그인하고 내 예약 보기'}
              </button>
              {loginError ? (
                <p className="mt-2 text-center text-[13px] font-semibold text-rose-500">{loginError}</p>
              ) : null}
            </section>
          ) : (
            <ReservationLookupForm
              onLookup={handleLookup}
              loading={loading}
              initialMode={recentCarNumber ? 'carNumber' : undefined}
              initialValue={recentCarNumber || undefined}
            />
          )}
        </>
      )}

      {lastReservationId &&
      !searched &&
      !member &&
      reservations.some((item) => item.id === lastReservationId) ? (
        <p className="px-1 text-xs font-semibold text-[#0f1a2e]">
          방금 예약한 내역이에요
        </p>
      ) : null}

      {reviewLinkHint && (
        <p className="rounded-2xl bg-[#f4f5f7] px-4 py-3 text-xs font-semibold text-[#0f1a2e]/70">
          {reviewLinkHint}
        </p>
      )}

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600 ring-1 ring-rose-100">
          {error}
        </p>
      )}

      {member || visibleReservations.length > 0 || (lookupMode === 'guest' && searched && !loading) ? (
        <section ref={reservationSectionRef}>
          {member ? (
            <>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h2 className="text-[16px] font-bold text-[#0f1a2e]">내 예약</h2>
                <p className="text-[13px] font-medium text-[#0f1a2e]/55">{tabCount}건</p>
              </div>
              <div className="mb-3 grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'active' as const, label: `진행 중 ${activeCount}` },
                    { id: 'done' as const, label: `완료 ${doneCount}` },
                    { id: 'cancelled' as const, label: `취소 ${cancelledCount}` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      userPickedReservationTabRef.current = true;
                      setReservationTab(tab.id);
                    }}
                    className={cn(
                      'rounded-xl py-2 text-[13px] font-semibold',
                      reservationTab === tab.id
                        ? 'bg-[#0f1a2e] text-white'
                        : 'bg-[#f4f5f7] text-[#0f1a2e]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </>
          ) : visibleReservations.length > 0 ? (
            <p className="mb-2 px-1 text-xs font-bold text-muted">
              예약 {visibleReservations.length}건
            </p>
          ) : null}
          {listedReservations.length > 0 ? (
            <div className="space-y-3">
              {listedReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  ref={(node) => {
                    reservationCardRefs.current[reservation.id] = node;
                  }}
                >
                  <ReservationCard
                    reservation={reservation}
                    company={companyMap[reservation.companyId]}
                    showVehicle={
                      !member || !(member.reservationIds ?? []).includes(reservation.id)
                    }
                    memberReview={Boolean(
                      member?.uid && reservation.userId && reservation.userId === member.uid
                    )}
                    onBookAirpick={onBookParking}
                    onCancel={(password) => handleCancel(reservation, password)}
                    lookupPassword={lookupPassword}
                    autoOpenReview={autoOpenReviewId === reservation.id}
                    onAutoOpenReviewHandled={() => {
                      if (autoOpenReviewId === reservation.id) {
                        setAutoOpenReviewId(null);
                        onReviewDeepLinkHandled?.();
                      }
                    }}
                    onSubmitReview={(password, rating, body, photoDataUrls) =>
                      handleSubmitReview(reservation, password, rating, body, photoDataUrls)
                    }
                  />
                </div>
              ))}
            </div>
          ) : member ? (
            reservationTab === 'active' ? (
              <div className="rounded-[20px] bg-[#f4f5f7] px-4 py-6 text-center">
                <p className="text-[16px] font-semibold text-[#0f1a2e]">진행 중인 예약이 없어요</p>
                <button
                  type="button"
                  onClick={onBookParking}
                  className="mt-4 h-[52px] w-full rounded-[16px] bg-gold text-[16px] font-semibold text-[#0f1a2e]"
                >
                  예약하러 가기
                </button>
              </div>
            ) : reservationTab === 'done' ? (
              <div className="rounded-[20px] bg-[#f4f5f7] px-4 py-6 text-center">
                <p className="text-[16px] font-semibold text-[#0f1a2e]">
                  아직 이용을 마친 예약이 없어요
                </p>
              </div>
            ) : (
              <div className="rounded-[20px] bg-[#f4f5f7] px-4 py-6 text-center">
                <p className="text-[16px] font-semibold text-[#0f1a2e]">취소한 예약이 없어요</p>
              </div>
            )
          ) : (
            <div className="rounded-[20px] bg-[#f4f5f7] px-4 py-8 text-center">
              <p className="text-[15px] font-semibold text-[#0f1a2e]">일치하는 예약이 없습니다</p>
              <p className="mt-1 text-[14px] font-medium text-[#0f1a2e]/55">
                입력한 차량번호·연락처·예약번호와 예약 비밀번호 4자리를 확인해 주세요
              </p>
              <button
                type="button"
                onClick={onBookParking}
                className="mt-4 rounded-xl bg-[#0f1a2e] px-5 py-2.5 text-[14px] font-semibold text-white"
              >
                예약하러 가기
              </button>
            </div>
          )}
        </section>
      ) : null}

      {member ? (
        <section>
          <div className={cn('flex items-center justify-between gap-3', showBookerFields && 'mb-2 px-1')}>
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold text-[#0f1a2e]">회원 정보</h2>
              {showBookerFields ? null : (
                <>
                  <p className="mt-0.5 truncate text-[14px] font-semibold text-[#0f1a2e]">
                    {profileName.trim()} · {profilePhone.trim()}
                  </p>
                  <p className="truncate text-[13px] font-medium text-[#0f1a2e]/55">
                    {profileModel.trim()} · {profileCar.trim()}
                  </p>
                </>
              )}
            </div>
            <InfoEditButton
              editing={editingBooker}
              onEdit={() => setEditingBooker(true)}
              onSave={() => void saveBooker()}
            />
          </div>
          {showBookerFields ? (
            <div className="rounded-[16px] bg-[#f4f5f7] px-4">
              <BookerField
                label="이름"
                value={profileName}
                placeholder="이름을 등록해주세요"
                editing={editingBooker}
                onChange={setProfileName}
              />
              <BookerField
                label="연락처"
                value={profilePhone}
                placeholder="연락처를 등록해주세요"
                editing={editingBooker}
                inputMode="tel"
                divider
                onChange={(value) => setProfilePhone(formatPhoneInput(value))}
              />
              <BookerField
                label="차종"
                value={profileModel}
                placeholder="차량 모델을 등록해주세요"
                editing={editingBooker}
                divider
                onChange={setProfileModel}
              />
              <BookerField
                label="차량번호"
                value={profileCar}
                placeholder="차량번호를 등록해주세요"
                editing={editingBooker}
                divider
                onChange={setProfileCar}
              />
            </div>
          ) : null}
          {bookerError ? (
            <p className="mt-2 px-1 text-[13px] font-semibold text-rose-500">{bookerError}</p>
          ) : null}
        </section>
      ) : null}

      {member ? (
        <section>
          <h2 className="mb-2 px-1 text-[13px] font-medium text-[#0f1a2e]/55">알림 설정</h2>
          <div className="overflow-hidden rounded-[20px] bg-[#f4f5f7]">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-[#0f1a2e]">
                  광고성 정보 수신 (문자·카카오톡)
                </p>
                <p className="mt-0.5 text-[12px] font-medium text-[#0f1a2e]/55">{marketingStatus}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={marketingOptIn}
                disabled={marketingSaving}
                onClick={() => void onToggleMarketing()}
                className={cn(
                  'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                  marketingOptIn ? 'bg-brand' : 'bg-[#0f1a2e]/20',
                  marketingSaving && 'opacity-60'
                )}
              >
                <span
                  className={cn(
                    'absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                    marketingOptIn ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>
          {marketingError ? (
            <p className="mt-2 px-1 text-[13px] font-semibold text-rose-500">{marketingError}</p>
          ) : null}
        </section>
      ) : null}

      {marketingResultLine ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-[#0f1a2e]/50"
            aria-label="닫기"
            onClick={() => setMarketingResultLine('')}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={marketingResultTitleId}
            className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-3xl"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 id={marketingResultTitleId} className="text-base font-bold text-[#0f1a2e]">
                처리 결과
              </h3>
              <button
                type="button"
                onClick={() => setMarketingResultLine('')}
                className="shrink-0 rounded-full p-1.5 hover:bg-[#f4f5f7]"
              >
                <X size={18} className="text-[#0f1a2e]/55" />
              </button>
            </div>
            <p className="text-[14px] font-medium leading-relaxed text-[#0f1a2e]">
              {marketingResultLine}
            </p>
            <button
              type="button"
              onClick={() => setMarketingResultLine('')}
              className="mt-4 w-full rounded-xl bg-[#0f1a2e] py-3 text-sm font-bold text-white"
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}

      {member ? (
        <>
          <section>
            <h2 className="mb-2 px-1 text-[13px] font-medium text-[#0f1a2e]/55">도움말</h2>
            <div className="overflow-hidden rounded-[20px] bg-[#f4f5f7]">
              {guideRows.map((row, index) => (
                <div key={row.key} className={index > 0 ? 'border-t border-[#0f1a2e]/8' : undefined}>
                  <GuideLink label={row.label} onClick={row.onClick} />
                </div>
              ))}
            <div className="border-t border-[#0f1a2e]/8">
              <p className="px-4 pb-1 pt-3 text-[12px] font-medium text-[#0f1a2e]/45">함께 보면 좋아요</p>
              {moreRows.map((row) => (
                <GuideLink key={row.key} label={row.label} onClick={row.onClick} />
              ))}
            </div>
          </div>
        </section>
        </>
      ) : (
        <section>
          <h2 className="mb-2 px-1 text-[13px] font-medium text-[#0f1a2e]/55">이용 가이드</h2>
          <div className="overflow-hidden rounded-[20px] bg-[#f4f5f7]">
            {guideRows.map((row, index) => (
              <div key={row.key} className={index > 0 ? 'border-t border-[#0f1a2e]/8' : undefined}>
                <GuideLink label={row.label} onClick={row.onClick} />
              </div>
            ))}
            <div className="border-t border-[#0f1a2e]/8">
              <p className="px-4 pb-1 pt-3 text-[12px] font-medium text-[#0f1a2e]/45">함께 보면 좋아요</p>
              {moreRows.map((row) => (
                <GuideLink key={row.key} label={row.label} onClick={row.onClick} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
