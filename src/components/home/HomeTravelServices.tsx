import { APP_TAB_SOON, HOME_TRAVEL_SERVICES } from '../../constants/marketing';
import type { AppTab } from '../../types';

/** 홈 하단 · 이심은 텍스트 링크만 (주차 CTA와 경쟁하지 않음) */
export default function HomeTravelServices({
  onGoTab,
}: {
  onGoTab: (tab: AppTab) => void;
}) {
  if (APP_TAB_SOON.esim) return null;

  return (
    <p className="border-t border-[#0f1a2e]/10 pt-8 text-center text-[14px] font-medium text-[#0f1a2e]/45 md:pt-10 md:text-[15px]">
      여행 준비
      {' · '}
      <button
        type="button"
        onClick={() => onGoTab('esim')}
        className="font-bold text-[#0f1a2e] underline-offset-2 hover:underline"
      >
        {HOME_TRAVEL_SERVICES.esimCta}
      </button>
    </p>
  );
}
