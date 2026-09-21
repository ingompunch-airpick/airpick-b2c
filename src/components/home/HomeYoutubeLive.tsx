import { useEffect, useState } from 'react';
import {
  YOUTUBE_LIVE,
  resolveYoutubeLiveEmbedSrc,
  resolveYoutubePosterUrl,
  resolveYoutubeVideoId,
} from '../../constants/youtubeLive';
import { cn } from '../../utils/cn';

/**
 * 홈 YouTube — 음소거·반복.
 * 유튜브는 시작 시 제목/로고를 잠깐 띄우므로, 그 구간만 포스터로 덮는다.
 */
export default function HomeYoutubeLive() {
  const videoId = resolveYoutubeVideoId();
  const src = resolveYoutubeLiveEmbedSrc();
  const posterUrl = resolveYoutubePosterUrl();
  const [coverVisible, setCoverVisible] = useState(true);

  useEffect(() => {
    if (!src) return;
    setCoverVisible(true);
    const id = window.setTimeout(() => setCoverVisible(false), YOUTUBE_LIVE.chromeHideMs);
    return () => window.clearTimeout(id);
  }, [src]);

  if (!src) return null;

  return (
    <section className="border-t border-[#0f1a2e]/10 pt-8 md:pt-10">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <p className="text-[10px] font-bold tracking-[0.14em] text-[#c9a962]">
          {YOUTUBE_LIVE.eyebrow}
        </p>
      </div>
      <h2 className="mt-1 text-[1.2rem] font-bold leading-snug tracking-tight text-[#0f1a2e] md:text-[1.35rem]">
        {YOUTUBE_LIVE.title}
      </h2>
      <p className="mt-2 max-w-lg text-[13px] font-medium leading-relaxed text-[#0f1a2e]/50 md:text-[14px]">
        {YOUTUBE_LIVE.lead}
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl bg-[#0f1a2e] shadow-[0_8px_28px_rgba(15,26,46,0.12)] ring-1 ring-[#0f1a2e]/12">
        <div className="relative aspect-video w-full">
          <iframe
            key={videoId || src}
            src={src}
            title={YOUTUBE_LIVE.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
          />
          <div
            className={cn(
              'pointer-events-none absolute inset-0 bg-[#0f1a2e] transition-opacity duration-500',
              coverVisible ? 'opacity-100' : 'opacity-0'
            )}
            aria-hidden
          >
            {posterUrl ? (
              <img
                key={posterUrl}
                src={posterUrl}
                alt=""
                width={640}
                height={360}
                className="h-full w-full object-cover opacity-90"
                decoding="async"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
