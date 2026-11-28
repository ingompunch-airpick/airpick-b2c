import type { AppTab } from '../types';

const prefetched = new Set<AppTab>();

/** 탭별 lazy 청크를 미리 받아 첫 진입 하얀 화면·지연을 줄인다 */
export function prefetchAppTab(tab: AppTab): void {
  if (tab === 'home' || prefetched.has(tab)) return;
  prefetched.add(tab);

  if (tab === 'compare') {
    import('../pages/ComparePage').catch(() => prefetched.delete(tab)); // 미리 받기 실패는 조용히 — 실제로 열 때 다시 받는다
    return;
  }
  if (tab === 'esim') {
    import('../pages/EsimPage').catch(() => prefetched.delete(tab)); // 미리 받기 실패는 조용히 — 실제로 열 때 다시 받는다
    return;
  }
  if (tab === 'my') {
    import('../pages/MyPage').catch(() => prefetched.delete(tab)); // 미리 받기 실패는 조용히 — 실제로 열 때 다시 받는다
  }
}

export function prefetchSecondaryTabs(): void {
  prefetchAppTab('compare');
  prefetchAppTab('esim');
  prefetchAppTab('my');
}
