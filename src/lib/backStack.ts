import { useEffect, useRef } from 'react';

/**
 * 창(시트·모달·전체화면 안내·달력)을 열면 브라우저 기록에 한 칸을 만들고,
 * 뒤로가기를 누르면 사이트를 떠나는 대신 맨 위 창만 닫는다.
 *
 * - 창이 여러 겹이면 위에서부터 하나씩 닫힌다.
 * - X·바깥 누르기로 닫으면 만들어 둔 칸을 되돌린다(history.back).
 *   되돌리는 중(비동기)에 새 창이 열리면, 되돌리기가 끝난 뒤 칸을 만든다 — 순서가 꼬이지 않게.
 * - 탭 이동처럼 다른 코드가 이미 기록을 바꿨으면 건드리지 않는다.
 */

type Entry = { id: number; close: () => void; pushed: boolean };

const STATE_KEY = 'airpickOverlay';
let nextId = 1;
const stack: Entry[] = [];
/** 우리가 부른 history.back() 중 아직 popstate가 안 온 수 */
let pendingBacks = 0;
/** 이번 popstate를 창 닫기가 처리했는지 — App의 탭 처리기가 건너뛰도록 */
let handledThisPop = false;

function currentOverlayId(): number | null {
  try {
    const st = window.history.state as Record<string, unknown> | null;
    const v = st?.[STATE_KEY];
    return typeof v === 'number' ? v : null;
  } catch {
    return null;
  }
}

function pushEntry(entry: Entry) {
  if (pendingBacks > 0 || entry.pushed) return;
  try {
    const prev = (window.history.state as Record<string, unknown> | null) || {};
    window.history.pushState({ ...prev, [STATE_KEY]: entry.id }, '', window.location.href);
    entry.pushed = true;
  } catch {
    /* 기록을 못 쓰는 환경 — 뒤로가기 처리는 포기 */
  }
}

function flushPending() {
  for (const entry of stack) pushEntry(entry);
}

if (typeof window !== 'undefined') {
  // 모듈을 불러올 때 등록 → App의 popstate 처리기보다 먼저 실행된다.
  window.addEventListener('popstate', () => {
    if (pendingBacks > 0) {
      pendingBacks -= 1;
      handledThisPop = true;
      if (pendingBacks === 0) flushPending();
      return;
    }
    const top = stack[stack.length - 1];
    if (top && top.pushed) {
      stack.pop();
      top.pushed = false;
      handledThisPop = true;
      top.close();
    }
  });
}

/** App의 popstate 처리기에서 호출 — true면 창 닫기용 뒤로가기라 탭 처리를 건너뛴다 */
export function consumeOverlayPop(): boolean {
  const v = handledThisPop;
  handledThisPop = false;
  return v;
}

/** 열려 있는 창을 기록에서 모두 지운다 (결제 완료 후 돌아왔을 때 등) */
export function resetOverlayStack() {
  stack.length = 0;
}

/**
 * 창 하나를 기록에 올린다. 돌려받은 함수를 부르면 「X로 닫음」 처리.
 * (훅 밖에서도 쓸 수 있게 분리 — 테스트용)
 */
export function openOverlay(close: () => void): () => void {
  const entry: Entry = { id: nextId++, close, pushed: false };
  stack.push(entry);
  pushEntry(entry);
  return () => {
    const idx = stack.indexOf(entry);
    if (idx === -1) return; // 뒤로가기로 이미 닫힘
    stack.splice(idx, 1);
    if (!entry.pushed) return; // 칸을 만들기 전에 닫힘
    entry.pushed = false;
    // 지금 기록 맨 위가 이 창의 칸일 때만 되돌린다
    if (currentOverlayId() === entry.id) {
      pendingBacks += 1;
      window.history.back();
    }
  };
}

/**
 * open이 true인 동안 뒤로가기로 onClose가 불리게 한다.
 * onClose는 매번 새 함수여도 된다.
 */
export function useBackToClose(open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    return openOverlay(() => closeRef.current());
  }, [open]);
}
