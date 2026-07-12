import type { ReceiptPublic } from '../types/receipt';

const RECEIPT_API_PATH = '/api/receipt';

export function getReceiptTokenFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('t');
}

export function parseReceiptIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/r\/([^/]+)\/?$/);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]).trim();
  } catch {
    return match[1].trim();
  }
}

/** id+token 또는 token-only(`/r/{token}`) */
export async function fetchPublicReceipt(
  idOrToken: string,
  tokenFromQuery?: string | null
): Promise<ReceiptPublic | null> {
  const params = new URLSearchParams();
  if (tokenFromQuery) {
    params.set('id', idOrToken);
    params.set('t', tokenFromQuery);
  } else {
    params.set('t', idOrToken);
  }
  const res = await fetch(`${RECEIPT_API_PATH}?${params.toString()}`);
  if (!res.ok) return null;
  return (await res.json()) as ReceiptPublic;
}
