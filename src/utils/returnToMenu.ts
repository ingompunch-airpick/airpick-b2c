/** 더보기 메뉴에서 나갔다가 돌아올 때 메뉴를 다시 연다 */

export const OPEN_MENU_STORAGE_KEY = 'airpick_open_menu';

export function markReturnToMenu(): void {
  try {
    sessionStorage.setItem(OPEN_MENU_STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function consumeReturnToMenu(): boolean {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('menu') === '1';
    const fromStorage = sessionStorage.getItem(OPEN_MENU_STORAGE_KEY) === '1';
    if (fromStorage) sessionStorage.removeItem(OPEN_MENU_STORAGE_KEY);
    if (fromQuery) {
      const url = new URL(window.location.href);
      url.searchParams.delete('menu');
      const next = `${url.pathname}${url.search}${url.hash}` || '/';
      window.history.replaceState(window.history.state ?? {}, '', next);
    }
    return fromQuery || fromStorage;
  } catch {
    return false;
  }
}

export function shouldReturnToMenuOnLaunch(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('menu') === '1') return true;
    return sessionStorage.getItem(OPEN_MENU_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
