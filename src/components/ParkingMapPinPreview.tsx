import { useEffect, useRef, useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { getNaverMapNcpKeyId, loadNaverMaps } from '../lib/loadNaverMaps';
import { buildNaverMapCoordUrl } from '../utils/airportDistance';
import { buildNaverMapSearchUrl } from '../utils/naverMap';

const DEFAULT_ZOOM = 16;

/** 네이버 JS 지도 실패 시에도 위치가 보이게 — OSM 정적 지도 */
function staticMapUrl(lat: number, lng: number): string {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${DEFAULT_ZOOM}&size=640x360&maptype=mapnik&markers=${lat},${lng},red-pushpin`;
}

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
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
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

        const bump = () => {
          try {
            map.autoResize();
            map.setCenter(center);
          } catch {
            /* ignore */
          }
        };
        resizeTimer = setTimeout(bump, 80);
        requestAnimationFrame(bump);

        ro = new ResizeObserver(bump);
        ro.observe(containerRef.current);
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      if (resizeTimer) clearTimeout(resizeTimer);
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
          {status === 'error' ? (
            <a
              href={href || buildNaverMapCoordUrl(lat, lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label="주차장 위치 지도 보기"
            >
              <img
                src={staticMapUrl(lat, lng)}
                alt=""
                className="h-52 w-full object-cover sm:h-56"
                loading="lazy"
                decoding="async"
              />
            </a>
          ) : (
            <div
              ref={containerRef}
              className="h-52 w-full bg-sky-soft sm:h-56"
              aria-label="주차장 위치 지도"
            />
          )}
          {status === 'loading' ? (
            <p className="border-t border-sky-border/50 px-3 py-2 text-[11px] font-medium text-muted">
              지도 불러오는 중…
            </p>
          ) : null}
          {status === 'error' ? (
            <p className="border-t border-sky-border/50 px-3 py-2 text-[11px] font-medium text-muted">
              지도를 탭하면 네이버 지도에서 확인할 수 있어요.
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
