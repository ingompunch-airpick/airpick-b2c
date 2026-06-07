export function buildNaverMapSearchUrl(address?: string): string | undefined {
  const trimmed = address?.trim();
  if (!trimmed) return undefined;
  return `https://map.naver.com/p/search/${encodeURIComponent(trimmed)}`;
}
