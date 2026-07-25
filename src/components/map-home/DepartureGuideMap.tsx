import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildGuideMapPaths,
  buildGuideMapPins,
  type GuideMapPin,
} from '../../data/departureGuideMap';
import { getNaverMapNcpKeyId, loadNaverMaps } from '../../lib/loadNaverMaps';
import type { CarParkingType } from '../../utils/departureGuide';
import { cn } from '../../utils/cn';

function pinLetter(index: number): string {
  return String.fromCharCode(65 + index); // A, B, C...
}

function pinColor(kind: GuideMapPin['kind']): string {
  if (kind === 'park') return '#3182f6';
  if (kind === 'alight') return '#0f766e';
  if (kind === 'shuttle_board') return '#1b64da';
  return '#475569';
}

function buildMarkerContent(pin: GuideMapPin, letter: string): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `
    display:flex;flex-direction:column;align-items:center;gap:2px;
    transform:translate(-50%, -100%);cursor:default;pointer-events:none;
  `;
  const badge = document.createElement('div');
  badge.style.cssText = `
    background:${pinColor(pin.kind)};color:#fff;
    font:700 11px/1.2 Pretendard,system-ui,sans-serif;
    padding:5px 9px;border-radius:999px;white-space:nowrap;
    border:2px solid #fff;box-shadow:0 2px 8px rgba(25,31,40,0.2);
  `;
  badge.textContent = `${letter} ${pin.label}`;
  el.appendChild(badge);
  return el;
}

export default function DepartureGuideMap({
  terminal,
  parking,
  className,
}: {
  terminal: 'T1' | 'T2';
  parking: CarParkingType;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const overlaysRef = useRef<Array<naver.maps.Marker | naver.maps.Polyline>>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing_key' | 'error'>('loading');

  const pins = useMemo(() => buildGuideMapPins(terminal, parking), [terminal, parking]);
  const paths = useMemo(() => buildGuideMapPaths(pins), [pins]);
  const pinKey = useMemo(
    () => pins.map((p) => `${p.id}:${p.lat}:${p.lng}`).join('|'),
    [pins]
  );

  useEffect(() => {
    if (!getNaverMapNcpKeyId()) {
      setStatus('missing_key');
      return;
    }
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    void loadNaverMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        const map = new maps.Map(containerRef.current, {
          center: new maps.LatLng(pins[0]?.lat ?? 37.45, pins[0]?.lng ?? 126.45),
          zoom: 14,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          logoControl: true,
          mapDataControl: false,
        });
        mapRef.current = map;
        setStatus('ready');
        ro = new ResizeObserver(() => map.autoResize());
        ro.observe(containerRef.current);
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      ro?.disconnect();
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready' || !window.naver?.maps || pins.length === 0) return;
    const maps = window.naver.maps;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    const bounds = new maps.LatLngBounds(
      new maps.LatLng(pins[0]!.lat, pins[0]!.lng),
      new maps.LatLng(pins[0]!.lat, pins[0]!.lng)
    );

    pins.forEach((pin, i) => {
      const letter = pinLetter(i);
      const position = new maps.LatLng(pin.lat, pin.lng);
      bounds.extend(position);
      const marker = new maps.Marker({
        position,
        map,
        title: `${letter} ${pin.label}`,
        icon: {
          content: buildMarkerContent(pin, letter),
          anchor: new maps.Point(0, 0),
        },
        zIndex: 100 + i,
      });
      overlaysRef.current.push(marker);
    });

    for (const path of paths) {
      if (path.length < 2) continue;
      const poly = new maps.Polyline({
        map,
        path: path.map((p) => new maps.LatLng(p.lat, p.lng)),
        strokeColor: '#3182f6',
        strokeOpacity: 0.55,
        strokeWeight: 4,
        strokeStyle: 'shortdash',
      });
      overlaysRef.current.push(poly);
    }

    map.fitBounds(bounds, { top: 48, right: 28, bottom: 28, left: 28 });
  }, [pinKey, paths, pins, status]);

  if (status === 'missing_key' || status === 'error') {
    return null;
  }

  const reassure =
    terminal === 'T1' && parking === 'long'
      ? '지도 A=주차, B·C=하차 가능 지점. 둘 중 어디든 제1터미널입니다.'
      : '지도 알파벳은 위치 표시용입니다. 아래 번호(1·2·3…)가 실제 동선 순서입니다.';

  return (
    <div className={cn('overflow-hidden rounded-xl ring-1 ring-sky-border', className)}>
      <div className="relative h-44 w-full bg-sky-tint">
        {status === 'loading' ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-[11px] font-medium text-muted">
            지도 불러오는 중…
          </div>
        ) : null}
        <div ref={containerRef} className="h-full w-full" role="presentation" />
      </div>
      <p className="border-t border-sky-border/60 bg-sky-soft/40 px-3 py-1.5 text-[10px] font-medium leading-relaxed text-muted">
        {reassure} 핀은 대략 위치 · 현장 표지판 우선.
      </p>
    </div>
  );
}
