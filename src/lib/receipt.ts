import type { ReceiptPublic } from '../types/receipt';

const RECEIPT_API_PATH = '/api/receipt';

export function getReceiptTokenFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('t');
}

export function parseReceiptIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/r\/([^/]+)\/?$/);
  return match?.[1] ?? null;
}

export async function fetchPublicReceipt(
  id: string,
  token: string
): Promise<ReceiptPublic | null> {
  const params = new URLSearchParams({ id, t: token });
  const res = await fetch(`${RECEIPT_API_PATH}?${params.toString()}`);
  if (!res.ok) return null;
  return (await res.json()) as ReceiptPublic;
}
