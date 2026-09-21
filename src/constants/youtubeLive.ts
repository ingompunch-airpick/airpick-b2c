/**
 * 홈 YouTube 현장 영상.
 * 채널: https://www.youtube.com/@에어픽주차
 * 일부공개 VOD — env 로도 덮어쓸 수 있음 (VITE_YOUTUBE_LIVE_VIDEO_ID)
 */
export const YOUTUBE_LIVE = {
  eyebrow: 'REC',
  title: '입점 업체 주차장',
  lead: '주차장까지 확인한 업체만 입점합니다.',
  handle: '@에어픽주차',
  channelId: 'UCvTBtg25mBplPe6rWdJ0eEQ',
  videoId: '1vHB2TlFYRk',
  /** 유튜브 시작 UI(제목·로고)가 사라진 뒤 덮개를 걷음 */
  chromeHideMs: 2200,
} as const;

export function resolveYoutubeVideoId(): string {
  return (
    (import.meta.env.VITE_YOUTUBE_LIVE_VIDEO_ID as string | undefined)?.trim() ||
    YOUTUBE_LIVE.videoId.trim()
  );
}

export function resolveYoutubeChannelId(): string {
  return (
    (import.meta.env.VITE_YOUTUBE_CHANNEL_ID as string | undefined)?.trim() ||
    YOUTUBE_LIVE.channelId.trim()
  );
}

export function resolveYoutubeLiveEmbedSrc(): string | null {
  const videoId = resolveYoutubeVideoId();
  const channelId = resolveYoutubeChannelId();

  if (videoId) {
    const id = encodeURIComponent(videoId);
    // loop는 playlist에 같은 ID를 넣어야 단일 영상이 반복됨
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${id}&rel=0&controls=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0`;
  }
  if (channelId) {
    return `https://www.youtube-nocookie.com/embed/live_stream?channel=${encodeURIComponent(channelId)}&autoplay=1&mute=1&playsinline=1&rel=0&controls=0&modestbranding=1`;
  }
  return null;
}

export function resolveYoutubePosterUrl(): string | null {
  const videoId = resolveYoutubeVideoId();
  if (!videoId) return null;
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}
