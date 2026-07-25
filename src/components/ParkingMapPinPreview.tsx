import { useEffect, useRef, useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { getNaverMapNcpKeyId, loadNaverMaps } from '../lib/loadNaverMaps';
import { buildNaverMapCoordUrl } from '../utils/airportDistance';
import { buildNaverMapSearchUrl } from '../utils/naverMap';

const DEFAULT_ZOOM = 16;

export default function ParkingMapPinPreview({
  address,
  mapUrl,
  lat,
  lng,
  distanceLabel,
}: {
  address?: string;
  mapUrl?: string;
  lat?: number;
  lng?: number;
  distanceLabel?: string;
}) {
  const hasPin = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
  const href =
    mapUrl ||
    (hasPin ? buildNaverMapCoordUrl(lat, lng) : undefined) ||
    (address ? buildNaverMapSearchUrl(address) : undefined);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    if (!hasPin || !getNaverMapNcpKeyId()) {
      setStatus(hasPin ? 'error' : 'idle');
      return;
    }

    let cancelled = false;
    let ro: ResizeObserver | null = null;
    setStatus('loading');

    void loadNaverMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        const center = new maps.LatLng(lat, lng);
        const map = new maps.Map(containerRef.current, {
          center,
          zoom: DEFAULT_ZOOM,
          zoomControl: true,
          zoomControlOptions: {
            position: maps.Position.RIGHT_CENTER,
            style: maps.ZoomControlStyle.SMALL,
          },
          mapTypeControl: false,
          scaleControl: false,
          logoControl: true,
          mapDataControl: false,
          scrollWheel: true,
          draggable: true,
          pinchZoom: true,
        });
        mapRef.current = map;
        markerRef.current = new maps.Marker({
          position: center,
          map,
        });
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
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [hasPin, lat, lng]);

  if (!hasPin && !distanceLabel && !href) return null;

  return (
    <div className="space-y-2">
      {hasPin ? (
        <div className="overflow-hidden rounded-xl ring-1 ring-sky-border/70">
          <div
            ref={containerRef}
            className="h-52 w-full bg-sky-soft sm:h-56"
            aria-label="주차장 위치 지도"
          />
          {status === 'loading' ? (
            <p className="border-t border-sky-border/50 px-3 py-2 text-[11px] font-medium text-muted">
              지도 불러오는 중…
            </p>
          ) : null}
          {status === 'error' ? (
            <p className="border-t border-sky-border/50 px-3 py-2 text-[11px] font-medium text-muted">
              앱 안 지도를 불러오지 못했습니다. 아래 링크로 확인해 주세요.
            </p>
          ) : null}
        </div>
      ) : null}

      {distanceLabel ? (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <MapPin size={13} className="shrink-0 text-brand" strokeWidth={2.25} />
          {distanceLabel}
        </p>
      ) : null}

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand underline-offset-2 hover:underline"
        >
          <ExternalLink size={12} strokeWidth={2.25} />
          네이버 지도 앱에서 열기
        </a>
      ) : null}
    </div>
  );
}
