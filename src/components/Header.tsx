import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, User } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { readMember, subscribeMember } from '../lib/memberSession';
import { subscribePointBalance } from '../lib/points';
import { cn } from '../utils/cn';
import type { AppTab } from '../types';
import { APP_NAV_TABS } from './BottomNav';

/** 앱 공통 — 네이비 스티키 헤더 (홈·탭 동일) */
export default function Header({
  onOpenMenu,
  onOpenAccount,
  loggedIn = false,
  wide = false,
  activeTab,
  onTabChange,
}: {
  /** PC(md+) 상단 메뉴 — 모바일은 하단 탭 */
  activeTab?: AppTab;
  onTabChange?: (tab: AppTab) => void;
  onOpenMenu?: () => void;
  onOpenAccount?: () => void;
  loggedIn?: boolean;
  /** 홈·PC 넓은 레이아웃 */
  wide?: boolean;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const [photoUrl, setPhotoUrl] = useState(() => readMember()?.photoUrl);
  const [memberUid, setMemberUid] = useState(() => readMember()?.uid ?? '');
  const [photoOk, setPhotoOk] = useState(true);
  const [pointBalance, setPointBalance] = useState(0);
  useEffect(
    () =>
      subscribeMember(() => {
        const member = readMember();
        setPhotoUrl(member?.photoUrl);
        setMemberUid(member?.uid ?? '');
        setPhotoOk(true);
      }),
    []
  );
  useEffect(() => {
    if (!loggedIn || !memberUid) {
      setPointBalance(0);
      return;
    }
    return subscribePointBalance(memberUid, setPointBalance);
  }, [loggedIn, memberUid]);
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const apply = () => {
      document.documentElement.style.setProperty('--app-header-h', `${el.getBoundingClientRect().height}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-[90] w-full bg-[#0f1a2e]">
      <div
        className={cn(
          'mx-auto flex items-center justify-between px-4 py-3 md:py-3.5',
          wide ? 'max-w-6xl md:px-10 lg:px-12' : onTabChange ? 'max-w-lg md:max-w-3xl' : 'max-w-lg'
        )}
      >
        <BrandLogo variant="premium" />
        {onTabChange ? (
          <nav aria-label="주요 메뉴" className="hidden items-center gap-1 md:flex">
            {APP_NAV_TABS.filter((t) => t.id !== 'my').map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                aria-current={activeTab === t.id ? 'page' : undefined}
                className={cn(
                  'rounded-full px-4 py-2 text-[15px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                  activeTab === t.id ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                {t.label}
              </button>
            ))}
            <a
              href="/guides/"
              className="rounded-full px-4 py-2 text-[15px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              이용 가이드
            </a>
          </nav>
        ) : null}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onOpenAccount}
            className="relative flex items-center gap-1.5 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={
              loggedIn ? `내 예약, ${pointBalance.toLocaleString()}포인트` : '로그인'
            }
          >
            {loggedIn && photoUrl && photoOk ? (
              <img
                src={photoUrl}
                alt=""
                onError={() => setPhotoOk(false)}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <User size={20} strokeWidth={loggedIn ? 2.4 : 1.75} fill={loggedIn ? 'currentColor' : 'none'} />
            )}
            {/* PC: 오른쪽 버튼이 곧 「내 예약」(상단 메뉴엔 중복으로 두지 않음) */}
            <span className="hidden pr-0.5 text-[14px] font-semibold text-white md:inline">
              {loggedIn ? '내 예약' : '로그인 · 예약 조회'}
            </span>
            {/* 포인트는 있을 때만 — 0포인트는 강조하지 않음 */}
            {loggedIn && pointBalance > 0 ? (
              <span className="rounded-full bg-[#c9a962] px-2 py-0.5 text-[12px] font-bold tabular-nums text-[#0a1628]">
                {pointBalance.toLocaleString()}P
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={onOpenMenu}
            className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="메뉴"
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
}
