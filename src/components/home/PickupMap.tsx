import { useEffect, useMemo, useRef, useState } from 'react';
import { getNaverMapNcpKeyId, loadNaverMaps } from '../../lib/loadNaverMaps';
import type { PickupPin } from '../../data/pickupPins';
import { cn } from '../../utils/cn';

function pinContent(pin: PickupPin): HTMLElement {
  const el = document.createElement('div');
  const color = pin.terminal === 'T2' ? '#e23d3d' : '#1d6fe8';
  el.textContent = pin.name;
  el.style.cssText = `
    background:${color};
    color:#ffffff;
    font:700 13px/1.2 Pretendard,system-ui,sans-serif;
    padding:7px 12px;
    border-radius:999px;
    white-space:nowrap;
    transform:translate(-50%, -100%);
  `;
  return el;
}

function drawSelectedPin(map: naver.maps.Map, pin: PickupPin): naver.maps.Marker[] {
  const maps = window.naver.maps;
  const position = new maps.LatLng(pin.lat, pin.lng);
  const marker = new maps.Marker({
    position,
    map,
    title: pin.name,
    icon: {
      content: pinContent(pin),
      anchor: new maps.Point(0, 0),
    },
  });
  map.setCenter(position);
  map.setZoom(16);
  return [marker];
}

export default function PickupMap({
  pins,
  selectedId,
  className,
}: {
  pins: PickupPin[];
  selectedId: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing_key' | 'error'>('loading');

  const pinKey = useMemo(
    () => pins.map((pin) => `${pin.terminal}:${pin.id}:${pin.lat}:${pin.lng}`).join('|'),
    [pins]
  );
  const pinsRef = useRef(pins);
  pinsRef.current = pins;

  useEffect(() => {
    if (!getNaverMapNcpKeyId()) {
      setStatus('missing_key');
      return;
    }
    let cancelled = false;
    void loadNaverMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const first = pinsRef.current[0];
        const showZoom = window.matchMedia('(min-width: 768px)').matches;
        try {
          mapRef.current = new maps.Map(containerRef.current, {
            center: new maps.LatLng(first?.lat ?? 37.4475, first?.lng ?? 126.4524),
            zoom: 16,
            zoomControl: showZoom,
            zoomControlOptions: { position: maps.Position.TOP_RIGHT },
            mapTypeControl: false,
            scaleControl: false,
            logoControl: true,
            mapDataControl: false,
          });
        } catch {
          if (!cancelled) setStatus('error');
          return;
        }
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
      try {
        markersRef.current.forEach((marker) => marker.setMap(null));
        mapRef.current?.destroy();
      } catch {
        // Naver throws a cross-origin error when a map is torn down.
      }
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const pin = pinsRef.current.find((item) => item.id === selectedId) ?? pinsRef.current[0];
    if (!map || !pin || status !== 'ready' || !window.naver?.maps) return;
    try {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = drawSelectedPin(map, pin);
    } catch {
      // Keep the open map if a marker refresh fails.
    }
  }, [pinKey, selectedId, status]);

  if (status === 'missing_key' || status === 'error') {
    return (
      <div className={cn('flex h-full min-h-64 items-center justify-center bg-[#0f1a2e]/5 px-4 text-center', className)}>
        <p className="text-[15px] font-semibold text-[#0f1a2e]/70">지도를 열지 못했습니다.</p>
      </div>
    );
  }

  return <div ref={containerRef} className={cn('h-full w-full', className)} />;
}
