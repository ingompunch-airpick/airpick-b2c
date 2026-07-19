import { useEffect, useState } from 'react';
import { Bus, ChevronDown, ChevronUp, ExternalLink, MapPinned, Phone } from 'lucide-react';
import type { OfficialParkingLot } from '../../data/officialParkingLots';
import { buildNaverMapCoordUrl } from '../../utils/airportDistance';
import { fetchIcnShuttle, formatShuttlePred, type IcnShuttleResponse } from '../../lib/icnShuttle';
import { buildNaverMapSearchUrl } from '../../utils/naverMap';

function ShuttleBlock({ lotId }: { lotId: string }) {
  const [data, setData] = useState<IcnShuttleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTimes, setShowTimes] = useState(false);
  const [timesLoading, setTimesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchIcnShuttle(lotId, false).then((res) => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    });
    const t = window.setInterval(() => {
      void fetchIcnShuttle(lotId, false).then((res) => {
        if (!cancelled && res) setData(res);
      });
    }, 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [lotId]);

  const openTimes = async () => {
    if (showTimes) {
      setShowTimes(false);
      return;
    }
    setShowTimes(true);
    const alreadyDetailed = data?.stops?.some((s) => (s.departures?.length ?? 0) > 0);
    if (alreadyDetailed) return;
    setTimesLoading(true);
    const res = await fetchIcnShuttle(lotId, true);
    setTimesLoading(false);
    if (res) setData(res);
  };

  const stops = data?.stops ?? [];

  return (
    <div
      className="mt-2.5 rounded-xl bg-white px-3 py-2.5 ring-1 ring-sky-border"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-2">
        <Bus size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />
        <div className="min-w-0 flex-1">
          {loading ? (
            <p className="text-[11px] font-medium text-muted">셔틀 정보 불러오는 중…</p>
          ) : data ? (
            <>
              <p className="text-xs font-bold text-ink">{data.routeLabel}</p>
              {data.liveStatus === 'unavailable' ? (
                <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-amber-700">
                  지금은 실시간 도착이 없습니다
                  {data.liveReason ? ` · ${data.liveReason}` : ''}
                  . 아래 시간표를 참고하세요.
                </p>
              ) : (
                <p className="mt-0.5 text-[10px] font-medium text-muted">
                  정류장 {data.stopCount ?? stops.length}곳 · 가장 빠른 도착{' '}
                  {formatShuttlePred(data.predMinutes)}
                </p>
              )}
              {stops.length > 0 ? (
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto overscroll-contain pr-0.5">
                  {stops.map((s) => (
                    <li
                      key={`${s.stopId}-${s.ord}`}
                      className="flex items-baseline justify-between gap-2 text-[11px]"
                    >
                      <span className="min-w-0 truncate font-semibold text-ink">
                        <span className="mr-1 font-bold text-brand">{s.ord}</span>
                        {s.name}
                      </span>
                      <span className="shrink-0 font-bold text-muted">
                        {data.liveStatus === 'unavailable'
                          ? '대기'
                          : formatShuttlePred(s.predMinutes)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <p className="text-[11px] font-medium text-muted">
              셔틀 실시간 정보를 불러오지 못했습니다.
            </p>
          )}
          <button
            type="button"
            onClick={() => void openTimes()}
            className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-bold text-brand"
          >
            정류장별 출발 시각
            {showTimes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showTimes ? (
            <div className="mt-2 border-t border-sky-border/60 pt-2">
              {timesLoading ? (
                <p className="text-[11px] text-muted">시간표 불러오는 중…</p>
              ) : stops.some((s) => (s.departures?.length ?? 0) > 0) ? (
                <ul className="max-h-48 space-y-2 overflow-y-auto overscroll-contain">
                  {stops.map((s) => (
                    <li key={`dep-${s.stopId}-${s.ord}`}>
                      <p className="text-[10px] font-bold text-ink">
                        {s.ord}. {s.name}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold leading-relaxed text-muted">
                        {(s.departures ?? []).length > 0
                          ? s.departures!.join(' · ')
                          : '출발 시각 없음'}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-muted">표시할 출발 시각이 없습니다.</p>
              )}
              {data?.note ? (
                <p className="mt-1.5 text-[10px] leading-relaxed text-muted">{data.note}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ParkingLotList({
  items,
  selectedId,
  onSelect,
}: {
  items: OfficialParkingLot[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((lot) => {
        const active = lot.id === selectedId;
        return (
          <li key={lot.id}>
            <div
              className={`w-full rounded-2xl px-4 py-3.5 text-left ring-1 transition ${
                active
                  ? 'bg-brand-soft ring-brand/40'
                  : 'bg-sky-soft/80 ring-sky-border/50'
              }`}
            >
              <button type="button" onClick={() => onSelect(lot.id)} className="w-full text-left">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-ink">{lot.name}</p>
                  <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-brand">
                    {lot.terminal}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted">
                  {lot.description}
                </p>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-ink">
                  {lot.address}
                </p>
              </button>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <a
                  href={
                    buildNaverMapSearchUrl(lot.navQuery) ||
                    buildNaverMapCoordUrl(lot.lat, lot.lng)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-brand ring-1 ring-sky-border"
                >
                  <MapPinned size={12} />
                  길찾기
                </a>
                {lot.infoUrl ? (
                  <a
                    href={lot.infoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-muted ring-1 ring-sky-border"
                  >
                    <ExternalLink size={12} />
                    공식 안내
                  </a>
                ) : null}
                {lot.phone ? (
                  <a
                    href={`tel:${lot.phone}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-muted ring-1 ring-sky-border"
                  >
                    <Phone size={12} />
                    전화
                  </a>
                ) : null}
              </div>
              {lot.shuttleEnabled && active ? <ShuttleBlock lotId={lot.id} /> : null}
              {lot.shuttleEnabled && !active ? (
                <p className="mt-2 text-[10px] font-medium text-muted">
                  선택하면 무료 셔틀 실시간·시간표 표시
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
