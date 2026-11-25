import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { consumeOverlayPop, resetOverlayStack, useBackToClose } from './lib/backStack';
import { DEFAULT_CANCEL_CUTOFF_HOURS } from './utils/reservationCancel';
import {
  ComparePageSkeleton,
  EsimPageSkeleton,
  HomePageSkeleton,
  MyPageSkeleton,
} from './components/LoadingSkeletons';
import AppMenuSheet from './components/AppMenuSheet';
import BottomNav from './components/BottomNav';
import BrandIntroGate, {
  clearBrandIntroSeen,
  markBrandIntroSeen,
  shouldForceBrandIntro,
} from './components/BrandIntroGate';
import Header from './components/Header';
import SiteFooter from './components/SiteFooter';
import { subscribeCompanies } from './lib/companies';
import {
  readBookingDraft,
  saveKakaoLoginError,
  saveKakaoProfileDraft,
} from './lib/bookingDraft';
import { cancelGuideSteps } from './constants/parkingSupport';
import { memberFromKakaoProfile, rememberedKakaoMember, saveKakaoMember } from './lib/members';
import { memberHasFrequentInfo, readMember, subscribeMember } from './lib/memberSession';
import { formatPhoneInput, isValidMobilePhone } from './utils/contact';
import {
  completeKakaoRedirectLogin,
  hasKakaoRedirectPending,
  isKakaoLoggedOutMark,
  readSignedInKakaoIdentity,
  socialLoginErrorMessage,
} from './lib/socialAuth';
import {
  trackCtaClick,
  trackParkingDetailView,
  trackScheduleInput,
  trackParkingBookComplete,
  trackParkingBookStart,
  trackTabView,
} from './lib/analytics';
import HomePage from './pages/HomePage';
import type { AppTab, BookingSearch, Company } from './types';
import {
  ESIM_COMPARE_DOCUMENT_TITLE,
  PARKING_COMPARE_DOCUMENT_TITLE,
} from './constants/marketing';
import { AIRPICK_HOME_DOCUMENT_TITLE } from './constants/companyLegal';
import {
  clearParkingCompanyQuery,
  clearReviewQueryParam,
  isPaymentCompletePath,
  isSeoDocumentPath,
  normalizePathname,
  readInitialTab,
  readParkingCompanyId,
  readPaymentIdFromLocation,
  readReviewReservationId,
  syncUrlToTab,
  tabFromPathname,
} from './utils/appPath';
import { captureAcquisitionFromLocation } from './utils/acquisition';
import { recordB2cShortPathVisit } from './lib/shortPathStats';
import {
  consumeReturnToMenu,
  shouldReturnToMenuOnLaunch,
} from './utils/returnToMenu';
import { defaultBookingSearch } from './utils/dates';
import { readBookingQueryPrefill } from './utils/bookingSearchFromQuery';
import { calculatePrice, applyAffiliateCustomerDiscount } from './utils/pricing';
import { isAirpickPartner } from './utils/compareSort';
import { useAffiliateOffer } from './context/AffiliateContext';
import { prefetchAppTab } from './utils/prefetchTabs';
import { setErrorReportContext } from './lib/errorReport';

const ComparePage = lazy(() => import('./pages/ComparePage'));
const EsimPage = lazy(() => import('./pages/EsimPage'));
const MyPage = lazy(() => import('./pages/MyPage'));
const CompanyDetailSheet = lazy(() => import('./components/CompanyDetailSheet'));
const BookingModal = lazy(() => import('./components/BookingModal'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const EsimGuidePage = lazy(() => import('./pages/EsimGuidePage'));
const ParkingGuidePage = lazy(() => import('./pages/ParkingGuidePage'));
const PaymentCompletePage = lazy(() => import('./pages/PaymentCompletePage'));

const DOCUMENT_TITLE: Record<AppTab, string> = {
  home: AIRPICK_HOME_DOCUMENT_TITLE,
  compare: PARKING_COMPARE_DOCUMENT_TITLE,
  esim: ESIM_COMPARE_DOCUMENT_TITLE,
  my: '내 예약 · 에어픽',
};

function tabPageFallback(tab: AppTab) {
  if (tab === 'home') return <HomePageSkeleton />;
  if (tab === 'compare') return <ComparePageSkeleton />;
  if (tab === 'esim') return <EsimPageSkeleton />;
  if (tab === 'my') return <MyPageSkeleton />;
  return null;
}

function shouldShowBrandIntroOnLaunch(initialTab: AppTab): boolean {
  if (shouldReturnToMenuOnLaunch()) return false;
  if (shouldForceBrandIntro()) {
    clearBrandIntroSeen();
    return true;
  }
  /**
   * 11-24: 인트로 게이트 폐지 → 같은 메시지를 홈 상단 배너(HomeBrandHero)로.
   * 예약하러 온 손님이 한 단계 더 누르지 않게. 옛 게이트는 ?intro=1 미리보기만.
   */
  void initialTab;
  return false;
}

export default function App() {
  const [tab, setTabState] = useState<AppTab>(() => readInitialTab());
  const [paymentCompleteOpen, setPaymentCompleteOpen] = useState(
    () => isPaymentCompletePath(window.location.pathname)
  );
  const [paymentCompleteId, setPaymentCompleteId] = useState<string | null>(() =>
    readPaymentIdFromLocation()
  );
  const [showBrandIntro, setShowBrandIntro] = useState(() =>
    shouldShowBrandIntroOnLaunch(readInitialTab())
  );
  const [search, setSearch] = useState<BookingSearch>(() => readBookingQueryPrefill().search);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerDetail, setPartnerDetail] = useState<{ company: Company; price: number } | null>(
    null
  );
  const [bookingTarget, setBookingTarget] = useState<{ company: Company; price: number } | null>(
    null
  );
  const [lastReservationId, setLastReservationId] = useState<string | null>(null);
  const [reviewReservationId, setReviewReservationId] = useState<string | null>(() =>
    readReviewReservationId()
  );
  const [pendingCompanyId, setPendingCompanyId] = useState<string | null>(() =>
    readParkingCompanyId() || readBookingQueryPrefill().partnerId
  );
  const [menuOpen, setMenuOpen] = useState(() => shouldReturnToMenuOnLaunch());
  const [loggedIn, setLoggedIn] = useState(() => Boolean(readMember()));
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportFromMenu, setSupportFromMenu] = useState(false);
  const [esimGuideOpen, setEsimGuideOpen] = useState(false);
  const [parkingGuideOpen, setParkingGuideOpen] = useState(false);
  const [cancelGuideOpen, setCancelGuideOpen] = useState(false);

  // 창이 열려 있을 때 뒤로가기 = 맨 위 창 닫기 (사이트를 떠나지 않게)
  useBackToClose(Boolean(partnerDetail), () => setPartnerDetail(null));
  useBackToClose(Boolean(bookingTarget), () => setBookingTarget(null));
  useBackToClose(menuOpen, () => setMenuOpen(false));
  useBackToClose(supportOpen, () => setSupportOpen(false));
  useBackToClose(esimGuideOpen, () => setEsimGuideOpen(false));
  useBackToClose(parkingGuideOpen, () => setParkingGuideOpen(false));
  useBackToClose(cancelGuideOpen, () => setCancelGuideOpen(false));

  // index.html 의 사업자 정보 푸터(React 밖)는 홈에서만 — 다른 탭은 SiteFooter가 있어 두 번 나오지 않게
  useEffect(() => {
    const el = document.getElementById('pg-legal-footer');
    if (el) el.hidden = !(tab === 'home' && !paymentCompleteOpen && !showBrandIntro);
  }, [tab, paymentCompleteOpen, showBrandIntro]);

  /**
   * 결제 완료 후 뒤로가기로 예전 화면이 브라우저 캐시에서 그대로 살아나면
   * 예약·결제 창이 열린 채 보일 수 있다 → 닫고 처음 화면으로.
   */
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      const readPaid = () => {
        try {
          const v = Boolean(sessionStorage.getItem('airpick.paidDone'));
          sessionStorage.removeItem('airpick.paidDone');
          return v;
        } catch {
          return false;
        }
      };
      if (!readPaid()) return;
      resetOverlayStack();
      setBookingTarget(null);
      setPartnerDetail(null);
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);
  const { offer: affiliateOffer } = useAffiliateOffer();
  const affiliateDiscountWon = affiliateOffer?.customerDiscountWon ?? 0;

  useEffect(() => {
    const screen = bookingTarget ? 'booking' : supportOpen ? 'support' : tab;
    setErrorReportContext({
      screen,
      companyId: bookingTarget?.company.id || partnerDetail?.company.id || '',
    });
  }, [tab, bookingTarget, partnerDetail, supportOpen]);

  const setTab = (next: AppTab, mode: 'push' | 'replace' = 'push') => {
    setTabState(next);
    syncUrlToTab(next, mode);
    window.scrollTo(0, 0);
  };

  const dismissBrandIntro = (target: 'home' | 'my' = 'home') => {
    markBrandIntroSeen();
    setShowBrandIntro(false);
    setTab(target, 'replace');
    trackCtaClick(target === 'my' ? 'brand_intro_my' : 'brand_intro_enter', 'brand_intro');
  };

  useEffect(() => {
    if (menuOpen) consumeReturnToMenu();
  }, [menuOpen]);

  const detailCompanyId = partnerDetail?.company.id;
  useEffect(() => {
    if (!partnerDetail) return;
    trackParkingDetailView(partnerDetail.company.id, partnerDetail.company.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailCompanyId]);

  useEffect(() => subscribeMember(() => setLoggedIn(Boolean(readMember()))), []);

  useEffect(() => {
    if (isKakaoLoggedOutMark()) return;
    let cancelled = false;
    void import('./firebase').then(async ({ auth }) => {
      await auth.authStateReady();
      if (cancelled || isKakaoLoggedOutMark()) return;
      const user = auth.currentUser;
      if (!user || user.isAnonymous) return;
      if (!user.providerData.some((item) => item.providerId === 'oidc.kakao')) return;
      const existing = readMember();
      if (existing?.uid === user.uid && existing.nickname && memberHasFrequentInfo(existing)) return;
      const identity = await readSignedInKakaoIdentity();
      if (cancelled || isKakaoLoggedOutMark()) return;
      const latest = readMember();
      if (latest?.uid === user.uid && latest.nickname && memberHasFrequentInfo(latest)) return;
      const base = await rememberedKakaoMember(user.uid, latest);
      if (cancelled || isKakaoLoggedOutMark()) return;
      if (!identity && !(base && memberHasFrequentInfo(base))) return;
      const fresh = readMember();
      const session = memberFromKakaoProfile(
        {
          provider: 'kakao',
          uid: user.uid,
          name: identity?.nickname || '',
          phone: '',
          email: user.email || '',
          photoUrl: identity?.photoUrl || '',
        },
        fresh?.uid === user.uid && fresh.nickname ? fresh : base
      );
      await saveKakaoMember(session).catch(() => undefined);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** 첫 페인트 뒤에 companies 1회 로드(세션 캐시) — PG 헤드리스 네트워크 타임아웃 완화 */
  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const start = () => {
      if (cancelled) return;
      unsub = subscribeCompanies((list) => {
        setCompanies(list.filter((c) => c.id !== 'airpick' && c.id !== 'air25' && c.id !== 'demo'));
        setLoading(false);
      });
    };

    const afterPaint = () => {
      const ric = (
        window as Window & {
          requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        }
      ).requestIdleCallback;
      if (typeof ric === 'function') {
        idleId = ric(start, { timeout: 2000 });
      } else {
        timeoutId = window.setTimeout(start, 100);
      }
    };

    const raf1 = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(afterPaint);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf1);
      if (idleId != null) {
        (
          window as Window & { cancelIdleCallback?: (id: number) => void }
        ).cancelIdleCallback?.(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
      unsub?.();
    };
  }, []);

  /** 카카오 로그인 같은 창 복귀 — 예약 창·입력값을 다시 연다 */
  useEffect(() => {
    if (loading || companies.length === 0) return;
    const draft = readBookingDraft();
    const redirectPending = hasKakaoRedirectPending();
    if (!draft && !redirectPending) return;

    void completeKakaoRedirectLogin()
      .then((profile) => {
        if (profile) {
          saveKakaoProfileDraft(profile);
          const phone = formatPhoneInput(profile.phone);
          const existing = readMember();
          void saveKakaoMember(
            memberFromKakaoProfile(profile, existing, {
              phone: isValidMobilePhone(phone) ? phone : '',
            })
          );
          setShowBrandIntro(false);
        } else if (redirectPending) {
          saveKakaoLoginError(
            '이전 카카오 로그인 결과가 브라우저에서 사라졌습니다. 카카오 로그인을 다시 눌러 주세요.'
          );
          setShowBrandIntro(false);
        }
        if (!draft) return;
        const company = companies.find((item) => item.id === draft.companyId);
        if (!company) return;
        setShowBrandIntro(false);
        setSearch(draft.search);
        setTab('home', 'replace');
        const isT2 = draft.search.terminal === 'T2';
        const price = calculatePrice(
          company,
          draft.search.departureDate,
          draft.search.arrivalDate,
          draft.search.isIndoor,
          isT2,
          draft.search.departureTime,
          draft.search.arrivalTime,
          false
        );
        setBookingTarget({
          company,
          price: applyAffiliateCustomerDiscount(price, affiliateDiscountWon),
        });
      })
      .catch((err) => {
        console.error('kakao redirect failed', err);
        saveKakaoLoginError(
          socialLoginErrorMessage(err) || '카카오 로그인에 실패했습니다. 다시 눌러 주세요.'
        );
        setShowBrandIntro(false);
        if (!draft) return;
        const company = companies.find((item) => item.id === draft.companyId);
        if (!company) return;
        setShowBrandIntro(false);
        setSearch(draft.search);
        setTab('home', 'replace');
        setBookingTarget({ company, price: 0 });
      });
  }, [loading, companies, affiliateDiscountWon]);

  useEffect(() => {
    trackTabView(tab);
    document.title = DOCUMENT_TITLE[tab];
  }, [tab]);

  /** 홈 진입 후 유휴 시 주차·이심·예약 청크 프리페치 */
  useEffect(() => {
    if (showBrandIntro) return;
    const run = () => prefetchAppTab('compare');
    const runRest = () => {
      prefetchAppTab('esim');
      prefetchAppTab('my');
    };
    let idleId = 0;
    let timeoutId = 0;
    const ric = window.requestIdleCallback;
    if (typeof ric === 'function') {
      idleId = ric(() => {
        run();
        timeoutId = window.setTimeout(runRest, 400);
      });
    } else {
      timeoutId = window.setTimeout(() => {
        run();
        window.setTimeout(runRest, 400);
      }, 800);
    }
    return () => {
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [showBrandIntro]);

  /** /parking?company= → 상세 시트 프리필 */
  useEffect(() => {
    if ((tab !== 'home' && tab !== 'compare') || loading || !pendingCompanyId) return;
    const company = companies.find((c) => c.id === pendingCompanyId && isAirpickPartner(c));
    if (!company) {
      clearParkingCompanyQuery();
      setPendingCompanyId(null);
      return;
    }
    const price = applyAffiliateCustomerDiscount(
      calculatePrice(
        company,
        search.departureDate,
        search.arrivalDate,
        search.isIndoor,
        search.terminal === 'T2',
        search.departureTime,
        search.arrivalTime,
        false
      ),
      affiliateDiscountWon
    );
    setPartnerDetail({ company, price });
    clearParkingCompanyQuery();
    setPendingCompanyId(null);
  }, [tab, loading, pendingCompanyId, companies, search, affiliateDiscountWon]);

  useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    if (isPaymentCompletePath(path)) {
      setPaymentCompleteOpen(true);
      setPaymentCompleteId(readPaymentIdFromLocation());
      return;
    }
    if (!isSeoDocumentPath(path)) {
      void recordB2cShortPathVisit(path, search, { allowOrganic: true });
      captureAcquisitionFromLocation(path, search, { allowOrganic: true });
    }
    if (!isSeoDocumentPath(path) && tabFromPathname(path) == null) {
      syncUrlToTab('home', 'replace');
      setTabState('home');
    }

    const onPopState = () => {
      // 창 닫기용 뒤로가기면 탭·주소 처리는 건너뛴다
      if (consumeOverlayPop()) return;
      const current = window.location.pathname;
      const currentSearch = window.location.search;
      if (isSeoDocumentPath(current)) {
        window.location.assign(current + currentSearch + window.location.hash);
        return;
      }
      if (isPaymentCompletePath(current)) {
        setPaymentCompleteOpen(true);
        setPaymentCompleteId(readPaymentIdFromLocation());
        return;
      }
      setPaymentCompleteOpen(false);
      setPaymentCompleteId(null);
      void recordB2cShortPathVisit(current, currentSearch, { allowOrganic: false });
      captureAcquisitionFromLocation(current, currentSearch, { allowOrganic: false });
      const next = tabFromPathname(current) ?? 'home';
      setTabState(next);
      if (next === 'compare') setPendingCompanyId(readParkingCompanyId());
      if (tabFromPathname(current) == null) {
        syncUrlToTab('home', 'replace');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  /** 손님이 일정·조건을 바꿀 때 — 퍼널 「일정 입력」 기록 */
  const changeSearch = (next: BookingSearch) => {
    const fields = (Object.keys(next) as (keyof BookingSearch)[]).filter((k) => next[k] !== search[k]);
    if (fields.length) trackScheduleInput(String(fields[0]));
    setSearch(next);
  };

  const leavePaymentComplete = (next: AppTab) => {
    setPaymentCompleteOpen(false);
    setPaymentCompleteId(null);
    setTab(next, 'replace');
  };

  /** 결제 실패 → 임시저장된 예약 내용으로 예약 창을 다시 연다 */
  const retryPaymentFromDraft = () => {
    const draft = readBookingDraft();
    const company = draft ? companies.find((item) => item.id === draft.companyId) : undefined;
    leavePaymentComplete('home');
    if (!draft || !company) return;
    setSearch(draft.search);
    setBookingTarget({ company, price: 0 });
  };

  const page = useMemo(() => {
    if (tab === 'home') {
      return (
        <HomePage
          search={search}
          onSearchChange={changeSearch}
          companies={companies}
          loading={loading}
          lastReservationId={lastReservationId}
          onOpenReservations={() => setTab('my')}
          onDetail={(company, price) => {
            setPartnerDetail({ company, price });
          }}
          onBook={(company, price) => {
            trackParkingBookStart(company.id, company.name);
            setBookingTarget({ company, price });
          }}
        />
      );
    }
    if (tab === 'compare') {
      return (
        <ComparePage
          search={search}
          onSearchChange={changeSearch}
          companies={companies}
          onBookOnAirpick={(company, price) => setPartnerDetail({ company, price })}
        />
      );
    }
    if (tab === 'esim') {
      return <EsimPage />;
    }
    return (
      <MyPage
        lastReservationId={lastReservationId}
        reviewReservationId={reviewReservationId}
        onReviewDeepLinkHandled={() => {
          clearReviewQueryParam();
          setReviewReservationId(null);
        }}
        onBookParking={() => {
          trackCtaClick('compare_parking', 'reservation');
          setTab('home');
        }}
        onOpenSupport={() => {
          trackCtaClick('open_faq', 'reservation');
          setSupportFromMenu(false);
          setSupportOpen(true);
        }}
        onOpenParkingGuide={() => {
          trackCtaClick('open_parking_guide', 'reservation');
          setParkingGuideOpen(true);
        }}
        onOpenCancelGuide={() => {
          trackCtaClick('open_cancel_guide', 'reservation');
          setCancelGuideOpen(true);
        }}
        onOpenEsimGuide={() => {
          trackCtaClick('open_esim_guide', 'reservation');
          setEsimGuideOpen(true);
        }}
      />
    );
  }, [tab, search, companies, lastReservationId, reviewReservationId]);

  const pageFallback = tabPageFallback(tab);

  if (showBrandIntro) {
    return <BrandIntroGate onEnter={dismissBrandIntro} />;
  }

  const homeTone = tab === 'home';

  if (paymentCompleteOpen || isPaymentCompletePath(normalizePathname(window.location.pathname))) {
    return (
      <div className="min-h-dvh bg-white text-ink">
        <Header
          wide={false}
          loggedIn={loggedIn}
          onOpenAccount={() => leavePaymentComplete('my')}
          onOpenMenu={() => setMenuOpen(true)}
          activeTab={tab}
          onTabChange={(next) => leavePaymentComplete(next)}
        />
        <main>
          <Suspense fallback={null}>
            <PaymentCompletePage
              paymentId={paymentCompleteId ?? readPaymentIdFromLocation()}
              onGoHome={() => leavePaymentComplete('home')}
              onGoMy={() => leavePaymentComplete('my')}
              onRetry={readBookingDraft() ? retryPaymentFromDraft : undefined}
            />
          </Suspense>
        </main>
        <BottomNav
          active={tab}
          tone="premium"
          onChange={(next) => leavePaymentComplete(next)}
          onPrefetchTab={prefetchAppTab}
        />
        {/* 결제 완료 화면에서도 ≡ 메뉴가 열리게 (전에는 메뉴 창을 그리지 않아 눌러도 반응 없었음) */}
        <Suspense fallback={null}>
          {menuOpen && (
            <AppMenuSheet
              onClose={() => setMenuOpen(false)}
              onGoTab={(next) => {
                setMenuOpen(false);
                leavePaymentComplete(next);
              }}
            />
          )}
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white text-ink">
      <Header
        wide={homeTone}
        loggedIn={loggedIn}
        onOpenAccount={() => setTab('my')}
        onOpenMenu={() => setMenuOpen(true)}
        activeTab={tab}
        onTabChange={(next) => {
          if (bookingTarget) setBookingTarget(null);
          setTab(next);
        }}
      />
      <main>
        {loading && (tab === 'home' || tab === 'compare') ? (
          tab === 'home' ? <HomePageSkeleton /> : <ComparePageSkeleton />
        ) : homeTone ? (
          <Suspense fallback={pageFallback}>{page}</Suspense>
        ) : (
          <div className="mx-auto max-w-lg px-4 pt-1 pb-24">
            <Suspense fallback={pageFallback}>{page}</Suspense>
            <SiteFooter tone="default" />
          </div>
        )}
      </main>
      <BottomNav
        active={tab}
        tone="premium"
        onChange={(next) => {
          if (bookingTarget) setBookingTarget(null);
          setTab(next);
        }}
        onPrefetchTab={prefetchAppTab}
      />

      <Suspense fallback={null}>
        {partnerDetail && (
          <CompanyDetailSheet
            company={partnerDetail.company}
            price={partnerDetail.price}
            search={search}
            affiliateDiscountWon={affiliateDiscountWon}
            onClose={() => setPartnerDetail(null)}
            onBook={() => {
              trackParkingBookStart(partnerDetail.company.id, partnerDetail.company.name);
              setBookingTarget(partnerDetail);
              setPartnerDetail(null);
            }}
          />
        )}

        {bookingTarget && (
          <BookingModal
            company={bookingTarget.company}
            search={search}
            price={bookingTarget.price}
            onClose={() => setBookingTarget(null)}
            onBooked={(id) => setLastReservationId(id)}
            onDismiss={() => {
              setBookingTarget(null);
              setSearch(defaultBookingSearch());
            }}
            onBrowseOtherCompanies={() => {
              setBookingTarget(null);
              setPartnerDetail(null);
              // 비교 목록은 홈에 있다 ('compare' 탭 주소는 홈으로 돌아가 버려서 쓰지 않음)
              setTab('home');
              window.setTimeout(() => document.getElementById('home-search')?.scrollIntoView({ block: 'start' }), 50);
            }}
            onSuccess={(id) => {
              trackParkingBookComplete(bookingTarget.company.id, bookingTarget.company.name);
              setLastReservationId(id);
              setBookingTarget(null);
              setSearch(defaultBookingSearch());
              setTab('my');
            }}
          />
        )}

        {menuOpen && (
          <AppMenuSheet
            onClose={() => setMenuOpen(false)}
            onGoTab={(next) => setTab(next)}
          />
        )}

        {supportOpen && (
          <SupportPage
            onBack={() => {
              setSupportOpen(false);
              if (supportFromMenu) {
                setSupportFromMenu(false);
                setMenuOpen(true);
              }
            }}
          />
        )}

        {esimGuideOpen && <EsimGuidePage onBack={() => setEsimGuideOpen(false)} />}

        {parkingGuideOpen && <ParkingGuidePage onBack={() => setParkingGuideOpen(false)} />}
        {cancelGuideOpen && (
          <ParkingGuidePage
            onBack={() => setCancelGuideOpen(false)}
            title="취소·변경 안내"
            headline={`입고 ${DEFAULT_CANCEL_CUTOFF_HOURS}시간 전까지 앱에서 취소`}
            lede={`${DEFAULT_CANCEL_CUTOFF_HOURS}시간이 지난 뒤 취소와 일정 변경은 예약 카드의 「업체 문의」로 주차장에 연락합니다.`}
            steps={cancelGuideSteps()}
          />
        )}
      </Suspense>
    </div>
  );
}
