export default function ComingSoonPanel({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-sky-soft px-4 py-10 text-center ring-1 ring-sky-border/50">
      <p className="text-sm font-bold text-ink">{label}</p>
      <p className="mt-2 text-xs font-medium leading-relaxed text-muted">
        곧 열릴 예정입니다.
        <br />
        주차대행·유심·eSIM은 아래 탭에서, 지금은 주차장을 이용해 주세요.
      </p>
    </div>
  );
}
