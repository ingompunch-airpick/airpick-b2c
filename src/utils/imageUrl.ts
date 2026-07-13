/**
 * 목록·카드용 썸네일 URL — 표시 크기(~64px)에 맞게 원격 이미지를 줄인다.
 * Unsplash / Firebase Storage / Google user content 위주.
 */
export function companyThumbnailUrl(
  url: string | undefined | null,
  sizePx = 128
): string {
  const src = (url || '').trim();
  if (!src) return '';

  try {
    const u = new URL(src);
    const host = u.hostname.toLowerCase();

    if (host === 'images.unsplash.com' || host.endsWith('.unsplash.com')) {
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('w', String(sizePx));
      u.searchParams.set('h', String(sizePx));
      u.searchParams.set('q', '60');
      return u.toString();
    }

    // Firebase Storage download URLs — Google image serving suffix
    if (
      host.includes('firebasestorage.googleapis.com') ||
      host.includes('storage.googleapis.com')
    ) {
      // 이미 =sNN 이 있으면 교체
      if (/=s\d+/.test(u.pathname + u.search)) {
        return src.replace(/=s\d+/i, `=s${sizePx}`);
      }
      if (u.searchParams.has('alt')) {
        // token URL — append size via Google's media param when possible
        return src;
      }
    }

    if (host.includes('googleusercontent.com') || host.includes('ggpht.com')) {
      if (/=s\d+/.test(src) || /=w\d+/.test(src)) {
        return src.replace(/=s\d+/i, `=s${sizePx}`).replace(/=w\d+-h\d+/i, `=s${sizePx}`);
      }
      return `${src}=s${sizePx}`;
    }
  } catch {
    return src;
  }

  return src;
}

/** 예약 카드 가로 스크롤 사진 — 조금 더 큰 썸네일 */
export function companyPhotoUrl(url: string | undefined | null, sizePx = 320): string {
  return companyThumbnailUrl(url, sizePx);
}
