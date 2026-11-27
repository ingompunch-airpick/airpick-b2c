import { useEffect } from 'react';

/**
 * 창(상세·예약·메뉴·후기)이 떠 있는 동안 뒤 화면이 같이 스크롤되지 않게 막는다.
 * 창이 여러 개 겹쳐도 마지막 창이 닫힐 때 한 번만 풀린다.
 */
let locks = 0;
let saved: { html: string; body: string } | null = null;

export function useBodyScrollLock(active = true): void {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;
    if (locks === 0) {
      saved = { html: html.style.overflow, body: body.style.overflow };
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    }
    locks += 1;
    return () => {
      locks = Math.max(0, locks - 1);
      if (locks === 0 && saved) {
        html.style.overflow = saved.html;
        body.style.overflow = saved.body;
        saved = null;
      }
    };
  }, [active]);
}
