/** 네이버 지도 JS SDK 로더 (Dynamic Map · ncpKeyId) */

declare global {
  interface Window {
    naver?: typeof naver;
  }
}

let loadPromise: Promise<typeof naver.maps> | null = null;

export function getNaverMapNcpKeyId(): string {
  return String(import.meta.env.VITE_NAVER_MAP_NCP_KEY_ID ?? '').trim();
}

export function loadNaverMaps(): Promise<typeof naver.maps> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('no_window'));
  }
  if (window.naver?.maps) {
    return Promise.resolve(window.naver.maps);
  }
  const key = getNaverMapNcpKeyId();
  if (!key) {
    return Promise.reject(new Error('missing_ncp_key'));
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-airpick-naver-maps]');
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.naver?.maps) resolve(window.naver.maps);
        else reject(new Error('naver_maps_unavailable'));
      });
      existing.addEventListener('error', () => reject(new Error('naver_script_error')));
      return;
    }

    const script = document.createElement('script');
    script.dataset.airpickNaverMaps = '1';
    script.async = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(key)}`;
    script.onload = () => {
      if (window.naver?.maps) resolve(window.naver.maps);
      else reject(new Error('naver_maps_unavailable'));
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('naver_script_error'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
