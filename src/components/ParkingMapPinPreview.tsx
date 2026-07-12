import { MapPin } from 'lucide-react';
import { buildOsmEmbedUrl, buildNaverMapCoordUrl } from '../utils/airportDistance';
import { buildNaverMapSearchUrl } from '../utils/naverMap';

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

  if (!hasPin && !distanceLabel && !href) return null;

  return (
    <div className="space-y-2">
      {hasPin && (
        <a
          href={href || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-xl ring-1 ring-sky-border/70"
          aria-label="네이버 지도에서 보기"
        >
          <iframe
            title="주차장 위치"
            src={buildOsmEmbedUrl(lat, lng)}
            className="h-36 w-full border-0 pointer-events-none"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </a>
      )}

      {distanceLabel && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <MapPin size={13} className="shrink-0 text-brand" strokeWidth={2.25} />
          {distanceLabel}
        </p>
      )}

      {/* 핀 없을 때는 큰 CTA 대신 작은 링크 — 거리는 카드 본문에 이미 표시 */}
      {!hasPin && href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand underline-offset-2 hover:underline"
        >
          <MapPin size={12} strokeWidth={2.25} />
          지도에서 위치 확인
        </a>
      )}
    </div>
  );
}
