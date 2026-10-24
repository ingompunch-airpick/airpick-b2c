import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  ComparePageSkeleton,
  EsimPageSkeleton,
  MyPageSkeleton,
} from './components/LoadingSkeletons';
import AppMenuSheet from './components/AppMenuSheet';
import BottomNav from './components/BottomNav';
import BrandIntroGate, {
  clearBrandIntroSeen,
  hasSeenBrandIntro,
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
import {
  clearParkingCompanyQuery,
  clearReviewQueryParam,
  isSeoDocumentPath,
  readInitialTab,
  readParkingCompanyId,
  readReviewReservationId,
  syncUrlToTab,
  tabFromPathname,
} from './utils/appPath';
import {
  consumeReturnToMenu,
  shouldReturnToMenuOnLaunch,
} from './utils/returnToMenu';
import { defaultBookingSearch } from './utils/dates';
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

const DOCUMENT_TITLE: Record<AppTab, string> = {
  home: `인천공항 주차대행, 한눈에 비교하세요. · 에어픽`,
  compare: PARKING_COMPARE_DOCUMENT_TITLE,
  esim: ESIM_COMPARE_DOCUMENT_TITLE,
  my: '내 예약 · 에어픽',
};

function tabPageFallback(tab: AppTab) {
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
  /** 직링크(/parking, /esim, /my)는 게이트 스킵. 홈은 이 브라우저에서 시작하기 전만 */
  return initialTab === 'home' && !hasSeenBrandIntro();
}

export default function App() {
  const [tab, setTabState] = useState<AppTab>(() => readInitialTab());
  const [showBrandIntro, setShowBrandIntro] = useState(() =>
    shouldShowBrandIntroOnLaunch(readInitialTab())
  );
  const [search, setSearch] = useState<BookingSearch>(defaultBookingSearch);
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
    readParkingCompanyId()
  );
  const [menuOpen, setMenuOpen] = useState(() => shouldReturnToMenuOnLaunch());
  const [loggedIn, setLoggedIn] = useState(() => Boolean(readMember()));
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportFromMenu, setSupportFromMenu] = useState(false);
  const [esimGuideOpen, setEsimGuideOpen] = useState(false);
  const [parkingGuideOpen, setParkingGuideOpen] = useState(false);
  const [cancelGuideOpen, setCancelGuideOpen] = useState(false);
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

  const dismissBrandIntro = () => {
    markBrandIntroSeen();
    setShowBrandIntro(false);
    setTab('home', 'replace');
    trackCtaClick('brand_intro_enter', 'brand_intro');
  };

  useEffect(() => {
    if (menuOpen) consumeReturnToMenu();
  }, [menuOpen]);

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

  useEffect(() => {
    const unsub = subscribeCompanies((list) => {
      setCompanies(list.filter((c) => c.id !== 'airpick' && c.id !== 'air25'));
      setLoading(false);
    });
    return unsub;
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
    if (!isSeoDocumentPath(path) && tabFromPathname(path) == null) {
      syncUrlToTab('home', 'replace');
      setTabState('home');
    }

    const onPopState = () => {
      const current = window.location.pathname;
      if (isSeoDocumentPath(current)) {
        window.location.assign(current + window.location.search + window.location.hash);
        return;
      }
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

  const page = useMemo(() => {
    if (tab === 'home') {
      return (
        <HomePage
          search={search}
          onSearchChange={setSearch}
          companies={companies}
          loading={loading}
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
          onSearchChange={(next) => setSearch(next)}
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

  return (
    <div className="min-h-dvh bg-white text-ink">
      <Header
        wide={homeTone}
        loggedIn={loggedIn}
        onOpenAccount={() => setTab('my')}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <main>
        {loading && (tab === 'home' || tab === 'compare') ? (
          <ComparePageSkeleton />
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
            onDismiss={() => {
              setBookingTarget(null);
              setSearch(defaultBookingSearch());
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
            onOpenSupport={() => {
              trackCtaClick('open_faq', 'menu');
              setSupportFromMenu(true);
              setSupportOpen(true);
            }}
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
            headline="입고 전까지 앱에서 취소"
            lede="시간을 지난 취소와 일정 변경은 예약 카드의 업체 문의로 주차장에 연락합니다."
            steps={cancelGuideSteps()}
          />
        )}
      </Suspense>
    </div>
  );
}
