import { ExternalLink, MapPin } from 'lucide-react';
import { buildNaverMapSearchUrl } from '../utils/naverMap';

export default function NaverMapPreview({
  address,
  mapUrl,
}: {
  address: string;
  mapUrl?: string;
}) {
  const href = mapUrl || buildNaverMapSearchUrl(address);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-xl bg-sky-tint py-3 text-xs font-bold text-brand ring-1 ring-sky-border/70 transition-colors hover:bg-sky-soft"
    >
      <MapPin size={14} strokeWidth={2.25} />
      네이버 지도에서 길 찾기
      <ExternalLink size={12} />
    </a>
  );
}
