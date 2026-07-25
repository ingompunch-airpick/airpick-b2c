import { ESIM_TAB_LABEL, PARKING_TAB_LABEL } from '../../constants/marketing';

export default function ComingSoonPanel({ label }: { label: string }) {
  const hint =
    label === ESIM_TAB_LABEL
      ? `지금은 ${PARKING_TAB_LABEL}과 출발 시각 계산을 이용해 주세요.`
      : '지금은 주차장을 이용해 주세요.';

  return (
    <div className="rounded-2xl bg-sky-soft px-4 py-10 text-center ring-1 ring-sky-border/50">
      <p className="text-sm font-bold text-ink">{label}</p>
      <p className="mt-1 text-[11px] font-bold tracking-wide text-brand">Soon</p>
      <p className="mt-2 text-xs font-medium leading-relaxed text-muted">
        곧 열릴 예정입니다.
        <br />
        {hint}
      </p>
    </div>
  );
}
