import type { AppTab } from '../types';

const prefetched = new Set<AppTab>();

/** 탭별 lazy 청크를 미리 받아 첫 진입 하얀 화면·지연을 줄인다 */
export function prefetchAppTab(tab: AppTab): void {
  if (tab === 'home' || prefetched.has(tab)) return;
  prefetched.add(tab);

  if (tab === 'compare') {
    void import('../pages/ComparePage');
    return;
  }
  if (tab === 'esim') {
    void import('../pages/EsimPage');
    return;
  }
  if (tab === 'my') {
    void import('../pages/MyPage');
  }
}

export function prefetchSecondaryTabs(): void {
  prefetchAppTab('compare');
  prefetchAppTab('esim');
  prefetchAppTab('my');
}
