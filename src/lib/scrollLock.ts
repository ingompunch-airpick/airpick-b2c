import { useEffect } from 'react';

/**
 * 창(상세·예약·메뉴·후기)이 떠 있는 동안 뒤 화면이 같이 스크롤되지 않게 막는다.
 * 창이 여러 개 겹쳐도 마지막 창이 닫힐 때 한 번만 풀린다.
 *
 * html 만 막는다. body 까지 overflow:hidden 을 주면 body 가 스크롤 상자가 돼서
 * 위쪽 고정 메뉴(sticky 헤더)가 스크롤한 만큼 화면 밖으로 밀려나고,
 * 그 자리로 뒤 화면(업체 사진 등)이 비쳐 보였다.
 */
let locks = 0;
let saved: { html: string } | null = null;

export function useBodyScrollLock(active = true): void {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    const html = document.documentElement;
    if (locks === 0) {
      saved = { html: html.style.overflow };
      html.style.overflow = 'hidden';
    }
    locks += 1;
    return () => {
      locks = Math.max(0, locks - 1);
      if (locks === 0 && saved) {
        html.style.overflow = saved.html;
        saved = null;
      }
    };
  }, [active]);
}
