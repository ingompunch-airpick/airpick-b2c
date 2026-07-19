import DepartureGuideCard from '../components/map-home/DepartureGuideCard';
import { AIRPICK_DEFINITION } from '../constants/companyLegal';
import type { AppTab } from '../types';

/** 홈 — 출국 동선 스타팅 (탭으로 다른 서비스 이동) */
export default function HomePage({ onGoTab: _onGoTab }: { onGoTab: (tab: AppTab) => void }) {
  return (
    <div className="space-y-4">
      <header className="pt-1">
        <p className="text-[11px] font-bold tracking-wide text-brand">에어픽</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-ink">출국 동선부터</h1>
        <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-muted">
          편명만 입력하면 체크인 카운터까지 한 번에 안내합니다. 주차대행·유심/이심·공항지도는 아래
          탭에서 이어갈 수 있어요.
        </p>
      </header>

      <DepartureGuideCard />

      <p className="border-t border-sky-border/60 pt-4 text-[11px] font-medium leading-relaxed text-muted">
        {AIRPICK_DEFINITION}
      </p>
    </div>
  );
}
