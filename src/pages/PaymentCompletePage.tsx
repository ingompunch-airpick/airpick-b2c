import { useEffect, useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import { clearBookingDraft } from '../lib/bookingDraft';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { isTestPaymentMode, readPaySummary, savePaySummary } from '../lib/paymentMode';
import {
  confirmReservationPayment,
  prepareReservationPayment,
  type PaymentConfirmState,
} from '../lib/reservationPayment';
import { requestPortoneCardPayment } from '../lib/portonePayment';

type LiveView = 'checking' | PaymentConfirmState;

/** 서버 확인 결과별 안내 (실결제) */
const LIVE_FAIL_TEXT: Partial<Record<LiveView, string>> = {
  failed: '결제가 완료되지 않았습니다.',
  refunded_late: '결제 시간(15분)이 지나 자리가 마감되어, 이번 결제는 자동으로 취소(환불)했어요.',
  refunded_duplicate: '이미 결제된 예약이라 이번 결제는 자동으로 취소(환불)했어요.',
  refunded_mismatch: '결제 금액이 예약 금액과 달라 자동으로 취소(환불)했어요. 다시 예약해 주세요.',
  unknown: '결제 정보를 찾지 못했어요. 내 예약에서 확인해 주세요.',
};

function readRedirectError(): { code: string; message: string } | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return null;
    return { code, message: params.get('message') || '결제가 완료되지 않았습니다.' };
  } catch {
    return null;
  }
}

export default function PaymentCompletePage({
  paymentId,
  onGoHome,
  onGoMy,
  onRetry,
}: {
  paymentId: string | null;
  onGoHome: () => void;
  /** 실결제 완료 → 내 예약 (방금 예약 id) */
  onGoMy?: (reservationId?: string) => void;
  /** 결제 실패 시 — 입력해 둔 예약 화면으로 돌아가 다시 결제 */
  onRetry?: () => void;
}) {
  const failure = readRedirectError();
  const summary = readPaySummary(paymentId);
  const live = Boolean(summary?.reservationId);
  const redirectFailed = Boolean(failure);
  const pointsOnly = Boolean(paymentId?.startsWith('points_'));
  const [liveView, setLiveView] = useState<LiveView>(
    pointsOnly ? 'paid' : live && failure ? 'failed' : 'checking'
  );
  const [bookingNo, setBookingNo] = useState(summary?.bookingNo ?? '');
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');

  // 실결제 — 서버가 포트원에 실제 결제를 확인할 때까지 잠깐 기다린다(웹훅이 늦을 수 있음)
  useEffect(() => {
    // 결제창에서 실패로 돌아온 경우(failure)는 처음부터 'failed' — 확인할 결제가 없다
    if (!live || pointsOnly || !paymentId || redirectFailed) return;
    let cancelled = false;
    void (async () => {
      for (let i = 0; i < 6 && !cancelled; i++) {
        const out = await confirmReservationPayment(paymentId).catch(() => ({ state: 'pending' as const }));
        if (cancelled) return;
        if ('bookingNo' in out && out.bookingNo) setBookingNo(out.bookingNo);
        if (out.state !== 'pending') {
          setLiveView(out.state);
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!cancelled) setLiveView('pending');
    })();
    return () => {
      cancelled = true;
    };
  }, [live, pointsOnly, paymentId, redirectFailed]);

  const ok = live ? liveView === 'paid' : Boolean(paymentId) && !failure;

  /** 실결제 실패 — 같은 예약(15분 안)으로 다시 결제 */
  const retryLive = async () => {
    if (!summary?.reservationId || retrying) return;
    setRetrying(true);
    setRetryError('');
    try {
      const prepared = await prepareReservationPayment(summary.reservationId);
      if ('paid' in prepared) {
        setLiveView('paid');
        return;
      }
      savePaySummary({ ...summary, paymentId: prepared.paymentId, amount: prepared.amount });
      await requestPortoneCardPayment({
        paymentId: prepared.paymentId,
        totalAmount: prepared.amount,
        orderName: summary.orderName,
        fullName: summary.buyerName || '',
        phoneNumber: summary.buyerPhone || '',
        email: summary.buyerEmail,
      });
      window.location.replace(`/payment/complete?paymentId=${encodeURIComponent(prepared.paymentId)}`);
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : '결제에 실패했습니다.');
    } finally {
      setRetrying(false);
    }
  };

  // 결제가 끝나면 예약 작성 임시저장을 지운다 — 안 지우면 홈으로 돌아갔을 때 확인 화면이 다시 열린다
  useEffect(() => {
    if (ok) {
      clearBookingDraft();
      try {
        sessionStorage.setItem('airpick.paidDone', paymentId || '1');
      } catch {
        /* 무시 */
      }
    }
  }, [ok, paymentId]);

  if (live) {
    const checking = liveView === 'checking';
    const waiting = liveView === 'pending';
    const failText = LIVE_FAIL_TEXT[liveView];
    const canRetry = liveView === 'failed';
    return (
      <div className="mx-auto flex min-h-[70dvh] max-w-lg flex-col px-5 pb-24 pt-8">
        <div className="flex flex-1 flex-col items-center text-center">
          <div
            className={
              ok
                ? 'flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15'
                : checking || waiting
                  ? 'flex h-16 w-16 items-center justify-center rounded-full bg-[#0f1a2e]/10'
                  : 'flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15'
            }
          >
            {ok ? (
              <Check size={32} className="text-emerald-600" strokeWidth={2.5} aria-hidden />
            ) : checking || waiting ? (
              <Loader2 size={30} className="animate-spin text-[#0f1a2e]/70" aria-hidden />
            ) : (
              <AlertCircle size={32} className="text-rose-600" strokeWidth={2.5} aria-hidden />
            )}
          </div>
          <h1 className="mt-5 text-2xl font-bold text-ink">
            {ok
              ? '예약이 완료되었습니다'
              : checking
                ? '결제를 확인하고 있어요'
                : waiting
                  ? '결제 확인이 늦어지고 있어요'
                  : '예약이 완료되지 않았습니다'}
          </h1>
          {waiting ? (
            <p className="mt-2 text-[15px] font-medium text-muted">
              결제가 확인되면 카카오 알림톡으로 예약 내용을 보내 드려요. 내 예약에서도 확인할 수 있어요.
            </p>
          ) : failText ? (
            <p className="mt-2 text-[15px] font-medium text-muted">
              {liveView === 'failed' && failure ? failure.message : failText}
            </p>
          ) : null}

          {summary && (ok || waiting) ? (
            <dl className="mt-6 w-full space-y-2.5 rounded-2xl bg-[#f4f5f7] p-4 text-left">
              {bookingNo ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[13px] font-semibold text-muted">예약번호</dt>
                  <dd className="text-right text-base font-bold text-ink tabular-nums">{bookingNo}</dd>
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[13px] font-semibold text-muted">업체</dt>
                <dd className="text-right text-sm font-bold text-ink">{summary.orderName}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[13px] font-semibold text-muted">일정</dt>
                <dd className="text-right text-sm font-bold text-ink tabular-nums">{summary.schedule}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[#0f1a2e]/10 pt-2.5">
                <dt className="text-[13px] font-semibold text-muted">결제 금액</dt>
                <dd className="text-base font-bold text-ink tabular-nums">{summary.amount.toLocaleString()}원</dd>
              </div>
            </dl>
          ) : null}

          {ok && isTestPaymentMode() ? (
            <p className="mt-3 text-[12px] font-medium text-muted">테스트 결제입니다. 실제로 청구되지 않습니다.</p>
          ) : null}
          {retryError ? <p className="mt-3 text-[13px] font-semibold text-rose-600">{retryError}</p> : null}

          <div className="mt-8 grid w-full gap-2">
            {canRetry ? (
              <button
                type="button"
                disabled={retrying}
                onClick={() => void retryLive()}
                className="w-full rounded-xl bg-[#0f1a2e] py-3.5 text-[16px] font-bold text-white disabled:opacity-40"
              >
                {retrying ? '결제창 여는 중…' : '같은 예약으로 다시 결제하기'}
              </button>
            ) : null}
            {(ok || waiting) && onGoMy ? (
              <button
                type="button"
                onClick={() => onGoMy(summary?.reservationId)}
                className="w-full rounded-xl bg-[#0f1a2e] py-3.5 text-[16px] font-bold text-white"
              >
                내 예약 보기
              </button>
            ) : null}
            {!checking ? (
              <button
                type="button"
                onClick={onGoHome}
                className="w-full rounded-xl bg-[#f4f5f7] py-3 text-[15px] font-bold text-[#0f1a2e]"
              >
                홈으로
              </button>
            ) : null}
          </div>
          {canRetry ? (
            <p className="mt-3 text-[12px] font-medium text-muted">결제하지 않으면 15분 뒤 예약이 자동으로 취소돼요.</p>
          ) : null}
        </div>
        <SiteFooter tone="default" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-lg flex-col px-5 pb-24 pt-8">
      <div className="flex flex-1 flex-col items-center text-center">
        <div
          className={
            ok
              ? 'flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15'
              : 'flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15'
          }
        >
          {ok ? (
            <Check size={32} className="text-emerald-600" strokeWidth={2.5} aria-hidden />
          ) : (
            <AlertCircle size={32} className="text-rose-600" strokeWidth={2.5} aria-hidden />
          )}
        </div>
        <h1 className="mt-5 text-2xl font-bold text-ink">
          {ok ? '결제가 완료되었습니다' : '결제가 완료되지 않았습니다'}
        </h1>
        {failure ? (
          <p className="mt-2 text-[15px] font-medium text-muted">{failure.message}</p>
        ) : null}

        {ok && summary ? (
          <dl className="mt-6 w-full space-y-2.5 rounded-2xl bg-[#f4f5f7] p-4 text-left">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">상품</dt>
              <dd className="text-right text-sm font-bold text-ink">{summary.orderName}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">일정</dt>
              <dd className="text-right text-sm font-bold text-ink tabular-nums">{summary.schedule}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#0f1a2e]/10 pt-2.5">
              <dt className="text-[13px] font-semibold text-muted">결제 금액</dt>
              <dd className="text-base font-bold text-ink tabular-nums">{summary.amount.toLocaleString()}원</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[13px] font-semibold text-muted">결제번호</dt>
              <dd className="break-all text-right text-[12px] font-semibold text-ink tabular-nums">{paymentId}</dd>
            </div>
          </dl>
        ) : ok ? (
          <p className="mt-4 w-full break-all rounded-2xl bg-[#f4f5f7] px-4 py-3 text-left text-[13px] font-semibold text-ink">
            <span className="block text-[12px] font-bold text-muted">결제번호</span>
            <span className="mt-1 block tabular-nums">{paymentId}</span>
          </p>
        ) : null}

        {ok && isTestPaymentMode() ? (
          <p className="mt-3 text-[12px] font-medium text-muted">테스트 결제입니다. 실제로 청구되지 않습니다.</p>
        ) : null}

        <div className="mt-8 grid w-full gap-2">
          {!ok && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="w-full rounded-xl bg-[#0f1a2e] py-3.5 text-[16px] font-bold text-white"
            >
              입력한 예약으로 다시 결제하기
            </button>
          ) : null}
          <button
            type="button"
            onClick={onGoHome}
            className={
              !ok && onRetry
                ? 'w-full rounded-xl bg-[#f4f5f7] py-3 text-[15px] font-bold text-[#0f1a2e]'
                : 'w-full rounded-xl bg-[#0f1a2e] py-3.5 text-[16px] font-bold text-white'
            }
          >
            홈으로
          </button>
        </div>
      </div>
      <SiteFooter tone="default" />
    </div>
  );
}
