import SiteFooter from '../components/SiteFooter';
import { Check } from 'lucide-react';

export default function PaymentCompletePage({
  paymentId,
  onGoHome,
  onGoMy,
}: {
  paymentId: string | null;
  onGoHome: () => void;
  onGoMy: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-lg flex-col px-5 pb-24 pt-8">
      <div className="flex flex-1 flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
          <Check size={32} className="text-emerald-600" strokeWidth={2.5} aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-ink">결제가 완료되었습니다</h1>
        <p className="mt-2 text-[15px] font-medium text-muted">
          포트원 결제 결과를 확인했습니다. PG 심사용 테스트 결제입니다.
        </p>
        {paymentId ? (
          <p className="mt-4 w-full break-all rounded-2xl bg-[#f4f5f7] px-4 py-3 text-left text-[13px] font-semibold text-ink">
            <span className="block text-[12px] font-bold text-muted">paymentId</span>
            <span className="mt-1 block tabular-nums">{paymentId}</span>
          </p>
        ) : (
          <p className="mt-4 text-[14px] font-semibold text-rose-600">
            paymentId를 받지 못했습니다. 결제창에서 다시 시도해 주세요.
          </p>
        )}
        <div className="mt-8 grid w-full gap-2">
          <button
            type="button"
            onClick={onGoMy}
            className="w-full rounded-xl bg-[#0f1a2e] py-3.5 text-[16px] font-bold text-white"
          >
            내 예약 보기
          </button>
          <button
            type="button"
            onClick={onGoHome}
            className="w-full py-2 text-[14px] font-semibold text-muted"
          >
            홈으로
          </button>
        </div>
      </div>
      <SiteFooter tone="default" />
    </div>
  );
}
