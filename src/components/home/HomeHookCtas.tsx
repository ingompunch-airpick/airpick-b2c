import { APP_TAB_SOON, HOME_HOOK_CTA } from '../../constants/marketing';
import type { AppTab } from '../../types';
import { cn } from '../../utils/cn';

/** 홈 · 후킹 CTA — 모바일 세로 / md+ 가로 */
export default function HomeHookCtas({
  onGoTab,
  tone = 'light',
}: {
  onGoTab: (tab: AppTab) => void;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';

  return (
    <div className={cn('flex flex-col gap-2.5', !dark && 'md:flex-row md:items-stretch')}>
      <button
        type="button"
        onClick={() => onGoTab('compare')}
        className={cn(
          'w-full rounded-xl py-3.5 text-[15px] font-bold transition active:scale-[0.99]',
          !dark && 'md:flex-1',
          dark
            ? 'bg-[#c9a962] text-[#0a1628]'
            : 'bg-[#0f1a2e] text-white shadow-[0_6px_16px_rgba(15,26,46,0.22)]'
        )}
      >
        {HOME_HOOK_CTA.parking}
      </button>
      {!APP_TAB_SOON.esim ? (
        <button
          type="button"
          onClick={() => onGoTab('esim')}
          className={cn(
            'w-full rounded-xl py-3 text-[14px] font-bold transition active:scale-[0.99] md:py-3.5',
            !dark && 'md:flex-1',
            dark
              ? 'bg-white/10 text-white ring-1 ring-white/25'
              : 'bg-neutral-50 text-[#0f1a2e] ring-1 ring-[#0f1a2e]/12'
          )}
        >
          {HOME_HOOK_CTA.esim}
        </button>
      ) : null}
    </div>
  );
}
