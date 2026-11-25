import { useEffect } from 'react';
import SiteFooter from '../components/SiteFooter';
import { clearBookingDraft } from '../lib/bookingDraft';
import { AlertCircle, Check } from 'lucide-react';
import { isTestPaymentMode, readPaySummary } from '../lib/paymentMode';

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
  onRetry,
}: {
  paymentId: string | null;
  onGoHome: () => void;
  onGoMy?: () => void;
  /** 결제 실패 시 — 입력해 둔 예약 화면으로 돌아가 다시 결제 */
  onRetry?: () => void;
}) {
  const failure = readRedirectError();
  const summary = readPaySummary(paymentId);
  const ok = Boolean(paymentId) && !failure;

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
