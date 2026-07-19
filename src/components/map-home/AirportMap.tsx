import { useEffect, useMemo, useRef, useState } from 'react';
import type { HomeMapPin } from '../../repositories/homeMapRepository';
import { getNaverMapNcpKeyId, loadNaverMaps } from '../../lib/loadNaverMaps';
import { cn } from '../../utils/cn';

const DEFAULT_CENTER = { lat: 37.4585, lng: 126.443 };
const DEFAULT_ZOOM = 13;

function pinColor(kind: HomeMapPin['kind']): string {
  if (kind === 'pickup') return '#3182f6';
  if (kind === 'service') return '#1b64da';
  return '#0f766e';
}

function buildPinContent(pin: HomeMapPin, selected: boolean): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `
    background:${pinColor(pin.kind)};
    color:#fff;
    font:700 11px/1.2 Pretendard,system-ui,sans-serif;
    padding:6px 10px;
    border-radius:999px;
    white-space:nowrap;
    border:2px solid #fff;
    box-shadow:${selected ? '0 0 0 3px rgba(49,130,246,0.35)' : '0 2px 8px rgba(25,31,40,0.18)'};
    cursor:pointer;
    transform:translate(-50%, -100%);
  `;
  el.textContent = pin.label;
  return el;
}

export default function AirportMap({
  pins,
  selectedPinId,
  onSelectPin,
  className,
}: {
  pins: HomeMapPin[];
  selectedPinId?: string | null;
  onSelectPin?: (pinId: string) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const onSelectRef = useRef(onSelectPin);
  onSelectRef.current = onSelectPin;

  const [status, setStatus] = useState<'loading' | 'ready' | 'missing_key' | 'error'>('loading');

  const pinKey = useMemo(
    () => pins.map((p) => `${p.id}:${p.lat}:${p.lng}:${p.label}`).join('|'),
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
          center: new maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
          zoom: DEFAULT_ZOOM,
          zoomControl: true,
          zoomControlOptions: {
            position: maps.Position.TOP_RIGHT,
          },
          mapTypeControl: false,
          scaleControl: false,
          logoControl: true,
          mapDataControl: false,
        });
        mapRef.current = map;
        setStatus('ready');

        ro = new ResizeObserver(() => {
          map.autoResize();
        });
        ro.observe(containerRef.current);
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      ro?.disconnect();
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready' || !window.naver?.maps) return;
    const maps = window.naver.maps;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (pins.length === 0) {
      map.setCenter(new maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng));
      map.setZoom(DEFAULT_ZOOM);
      return;
    }

    const bounds = new maps.LatLngBounds(
      new maps.LatLng(pins[0]!.lat, pins[0]!.lng),
      new maps.LatLng(pins[0]!.lat, pins[0]!.lng)
    );

    for (const pin of pins) {
      const position = new maps.LatLng(pin.lat, pin.lng);
      bounds.extend(position);
      const marker = new maps.Marker({
        position,
        map,
        title: pin.label,
        icon: {
          content: buildPinContent(pin, pin.id === selectedPinId),
          anchor: new maps.Point(0, 0),
        },
      });
      maps.Event.addListener(marker, 'click', () => onSelectRef.current?.(pin.id));
      markersRef.current.push(marker);
    }

    if (pins.length === 1) {
      map.setCenter(new maps.LatLng(pins[0]!.lat, pins[0]!.lng));
      map.setZoom(14);
    } else {
      map.fitBounds(bounds, { top: 80, right: 40, bottom: 220, left: 40 });
    }
  }, [pinKey, selectedPinId, pins, status]);

  if (status === 'missing_key') {
    return (
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2 bg-sky-tint px-6 text-center',
          className
        )}
      >
        <p className="text-sm font-bold text-ink">네이버 지도 키가 필요합니다</p>
        <p className="text-xs font-medium leading-relaxed text-muted">
          NCP에서 Maps · Dynamic Map을 켜고
          <br />
          <code className="rounded bg-white px-1 py-0.5 text-[10px]">VITE_NAVER_MAP_NCP_KEY_ID</code>
          를 <code className="rounded bg-white px-1 py-0.5 text-[10px]">.env</code>에 넣어 주세요.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2 bg-sky-tint px-6 text-center',
          className
        )}
      >
        <p className="text-sm font-bold text-ink">지도를 불러오지 못했습니다</p>
        <p className="text-xs font-medium text-muted">
          NCP 도메인 등록(localhost · www.에어픽.kr)을 확인해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('relative h-full w-full bg-sky-tint', className)}>
      {status === 'loading' ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-xs font-medium text-muted">
          네이버 지도 불러오는 중…
        </div>
      ) : null}
      <div ref={containerRef} className="h-full w-full" role="presentation" />
    </div>
  );
}
