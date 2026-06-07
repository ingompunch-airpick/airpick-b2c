import { ExternalLink, MapPin } from 'lucide-react';
import { buildNaverMapSearchUrl } from '../utils/naverMap';

export default function NaverMapPreview({
  address,
  mapUrl,
  mapEmbedUrl,
}: {
  address: string;
  mapUrl?: string;
  mapEmbedUrl?: string;
}) {
  const href = mapUrl || buildNaverMapSearchUrl(address);

  return (
    <div className="overflow-hidden rounded-xl bg-sky-tint ring-1 ring-sky-border/70">
      {mapEmbedUrl ? (
        <iframe
          title={`${address} 네이버 지도`}
          src={mapEmbedUrl}
          className="h-40 w-full border-0 bg-sky-soft"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="flex h-32 items-center justify-center bg-gradient-to-br from-sky-tint to-sky-soft px-4">
          <MapPin size={28} className="text-brand/40" />
        </div>
      )}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 border-t border-sky-border/60 bg-sky-soft py-2.5 text-xs font-bold text-brand"
        >
          네이버 지도에서 크게 보기
          <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}
