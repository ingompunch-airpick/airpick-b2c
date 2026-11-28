import { lazy, type ComponentType } from 'react';

/**
 * 새로 배포하면 예전 화면 조각 파일(assets/*.js)이 사라진다.
 * 배포 전에 열어 둔 탭에서 예약 창 등을 처음 열면 「Failed to fetch dynamically imported module」로
 * 화면이 멈췄다 (오류 보고 2026-11-26 · BookingModal).
 * → 이런 오류면 페이지를 한 번만 새로고침해 새 버전을 받는다. 30초 안에 또 나면 무한 새로고침을 막으려고 그냥 오류로 둔다.
 */

const RELOAD_KEY = 'airpick.chunkReloadAt';
const RELOAD_GUARD_MS = 30_000;

export function isChunkLoadError(err: unknown): boolean {
  const msg = String((err as { message?: unknown })?.message ?? err ?? '');
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Loading (CSS )?chunk [\w-]+ failed|Unable to preload CSS/i.test(
    msg
  );
}

/** 새로고침했으면 true. 방금 새로고침했던 거면 false (무한 반복 방지) */
export function reloadOnceForNewVersion(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (last && Date.now() - last < RELOAD_GUARD_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // 저장소가 막힌 브라우저 — 한 번은 새로고침해 본다
  }
  window.location.reload();
  return true;
}

/** React.lazy 대신 — 조각 파일을 못 받으면 새로고침해서 새 버전으로 */
export function lazyWithReload<T extends ComponentType<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((err: unknown) => {
      if (isChunkLoadError(err) && reloadOnceForNewVersion()) {
        // 새로고침이 끝날 때까지 기다린다 (오류 화면을 잠깐이라도 띄우지 않게)
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    })
  );
}

/** Vite 가 미리 불러오다 실패할 때 내는 이벤트도 같은 방식으로 처리 */
export function installChunkReload(): void {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnceForNewVersion()) event.preventDefault();
  });
}
