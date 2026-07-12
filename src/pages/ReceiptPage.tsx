import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchPublicReceipt, getReceiptTokenFromLocation } from '../lib/receipt';
import type { ReceiptPublic } from '../types/receipt';
import { formatPhoneDisplay } from '../utils/contact';
import { parkingTypeLabel } from '../utils/parkingType';

function formatReceiptDateTime(date: string, time: string): string {
  if (!date) return '-';
  const [y, m, d] = date.split('-');
  const datePart =
    y && m && d ? `${y}년 ${Number(m)}월 ${Number(d)}일` : date.replace(/-/g, '.');
  return time ? `${datePart} ${time}` : datePart;
}

function travelLine(receipt: ReceiptPublic): string {
  const dest = receipt.destination?.trim();
  const airline = receipt.departureAirline?.trim();
  const flight = receipt.departureFlight?.trim();
  const parts = [dest, airline, flight].filter(Boolean);
  return parts.length ? parts.join(' · ') : '-';
}

export default function ReceiptPage({ reservationId }: { reservationId: string }) {
  const [receipt, setReceipt] = useState<ReceiptPublic | null>(null);
  const [error, setError] = useState<'missing_token' | 'not_found' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // `/r/{id}?t={token}` 또는 `/r/{token}` (토큰만 path)
    const queryToken = getReceiptTokenFromLocation();
    const lookup = queryToken
      ? fetchPublicReceipt(reservationId, queryToken)
      : fetchPublicReceipt(reservationId);

    let cancelled = false;
    void lookup.then((data) => {
      if (cancelled) return;
      if (!data) {
        setError('not_found');
      } else {
        setReceipt(data);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reservationId]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white text-sm text-muted">
        접수증 불러오는 중…
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-white px-6 text-center">
        <p className="text-base font-bold text-ink">접수증을 열 수 없습니다</p>
        <p className="text-sm text-muted">
          {error === 'missing_token'
            ? '카카오톡에 받은 링크 전체를 눌러 주세요.'
            : '링크가 만료되었거나 올바르지 않습니다.'}
        </p>
      </div>
    );
  }

  const receiptNo = receipt.id.replace(/^res_/, '');

  return (
    <div className="min-h-dvh bg-neutral-100 px-4 py-6 print:bg-white print:p-0">
      <div className="receipt-sheet mx-auto max-w-lg bg-white p-6 shadow-md print:max-w-none print:shadow-none">
        <div className="border-b-2 border-neutral-800 pb-4 text-center">
          <p className="text-xs font-semibold tracking-wide text-neutral-500">차량보관증</p>
          <h1 className="mt-1 text-xl font-bold text-neutral-900">{receipt.companyName}</h1>
          <p className="mt-1 text-xs text-neutral-500">NO. {receiptNo}</p>
        </div>

        <table className="mt-4 w-full border-collapse text-sm">
          <tbody>
            <Row label="차종" value={receipt.carModel || '-'} />
            <Row label="차량번호" value={receipt.carNumber} bold />
            <Row
              label="접수일시"
              value={formatReceiptDateTime(receipt.departureDate, receipt.departureTime)}
            />
            <Row
              label="도착일시"
              value={formatReceiptDateTime(receipt.arrivalDate, receipt.arrivalTime)}
            />
            <Row label="여행 · 항공" value={travelLine(receipt)} />
            <Row label="주차 구분" value={parkingTypeLabel(receipt.isIndoor)} />
            <Row
              label="총주차금액"
              value={
                receipt.totalPrice > 0
                  ? `${receipt.totalPrice.toLocaleString('ko-KR')}원`
                  : '미정'
              }
              bold
            />
            <Row label="고객명" value={receipt.userName} />
            <Row label="고객연락처" value={formatPhoneDisplay(receipt.phone) || receipt.phone} />
            <Row
              label="터미널"
              value={`${receipt.departureTerminal}${
                receipt.arrivalTerminal && receipt.arrivalTerminal !== receipt.departureTerminal
                  ? ` → ${receipt.arrivalTerminal}`
                  : ''
              }`}
            />
          </tbody>
        </table>

        <div className="mt-6 border-t border-neutral-200 pt-4 text-[10px] leading-relaxed text-neutral-600">
          <p className="font-bold text-neutral-800">주차대행서비스 표준약관 (요약)</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>서비스 제공은 차량 인도 시점에 종료됩니다.</li>
            <li>당사 귀책 사고는 보험·약관에 따라 보상합니다.</li>
            <li>차량 내 귀중품 분실·미세 흠집 등은 약관에 따릅니다.</li>
          </ul>
          <p className="mt-3 text-neutral-500">
            본 접수증은 예약 접수 확인용이며, 현장 요금·조건은 업체 안내를 따릅니다.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-4 flex max-w-lg justify-center print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white"
        >
          <Printer size={18} />
          인쇄 · 저장
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className="border-b border-neutral-200">
      <th className="w-[32%] bg-neutral-50 px-3 py-2.5 text-left text-xs font-bold text-neutral-700">
        {label}
      </th>
      <td
        className={`px-3 py-2.5 text-left text-sm text-neutral-900 ${bold ? 'font-bold' : 'font-medium'}`}
      >
        {value}
      </td>
    </tr>
  );
}
