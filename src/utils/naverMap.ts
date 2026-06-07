export function buildNaverMapSearchUrl(address?: string): string | undefined {
  const trimmed = address?.trim();
  if (!trimmed) return undefined;
  return `https://map.naver.com/v5/search/${encodeURIComponent(trimmed)}`;
}

/** API 키 없이 MY에 삽입 가능한 네이버 지도 embed URL */
export function buildNaverMapEmbedUrl(address?: string): string | undefined {
  const trimmed = address?.trim();
  if (!trimmed) return undefined;
  return `https://map.naver.com/v5/embed/search/${encodeURIComponent(trimmed)}`;
}
