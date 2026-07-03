export function buildPublicReceiptUrl(
  origin: string,
  reservationId: string,
  receiptToken: string
): string {
  const base = origin.replace(/\/$/, '');
  return `${base}/r/${encodeURIComponent(reservationId)}?t=${encodeURIComponent(receiptToken)}`;
}
