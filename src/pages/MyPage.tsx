export default function MyPage({
  lastReservationId,
}: {
  lastReservationId: string | null;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-sky-soft p-6 shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
        <h2 className="text-lg font-bold text-ink">주차 예약</h2>
        <p className="mt-2 text-sm text-muted">
          차량번호·연락처로 예약 조회 기능은 다음 단계에서 연결합니다.
        </p>
        {lastReservationId ? (
          <div className="mt-4 rounded-2xl bg-sky-tint p-4">
            <p className="text-xs font-bold text-muted">최근 접수 번호</p>
            <p className="mt-1 font-mono text-sm font-bold text-brand">{lastReservationId}</p>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-sky-tint px-4 py-3 text-sm text-muted">
            예약 내역이 없습니다
          </p>
        )}
      </section>

      <section className="rounded-3xl bg-sky-soft p-6 shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
        <h2 className="text-lg font-bold text-ink">유심·eSIM</h2>
        <p className="mt-2 text-sm text-muted">
          구매·발급 내역은 결제 연동 후 이곳에서 확인할 수 있습니다.
        </p>
        <p className="mt-4 rounded-2xl bg-sky-tint px-4 py-3 text-sm text-muted">
          주문 내역이 없습니다
        </p>
      </section>
    </div>
  );
}
