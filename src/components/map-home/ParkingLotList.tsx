import { useEffect, useState } from 'react';
import { Bus, ChevronDown, ChevronUp, ExternalLink, MapPinned, Phone } from 'lucide-react';
import type { OfficialParkingLot } from '../../data/officialParkingLots';
import { buildNaverMapCoordUrl } from '../../utils/airportDistance';
import { fetchIcnShuttle, formatShuttlePred, type IcnShuttleResponse } from '../../lib/icnShuttle';

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
    if (data?.departures?.length) return;
    setTimesLoading(true);
    const res = await fetchIcnShuttle(lotId, true);
    setTimesLoading(false);
    if (res) setData(res);
  };

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
              <p className="text-xs font-bold text-ink">{formatShuttlePred(data.predMinutes)}</p>
              <p className="mt-0.5 text-[10px] font-medium text-muted">{data.routeLabel}</p>
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
            시간표 · 출발 정보
            {showTimes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showTimes ? (
            <div className="mt-2 border-t border-sky-border/60 pt-2">
              {timesLoading ? (
                <p className="text-[11px] text-muted">시간표 불러오는 중…</p>
              ) : data?.departures && data.departures.length > 0 ? (
                <>
                  <p className="text-[10px] font-medium text-muted">오늘 이후 출발(노선 기준)</p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-ink">
                    {data.departures.join(' · ')}
                  </p>
                  {data.note ? (
                    <p className="mt-1.5 text-[10px] leading-relaxed text-muted">{data.note}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-[11px] text-muted">표시할 출발 시각이 없습니다.</p>
              )}
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
              </button>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <a
                  href={buildNaverMapCoordUrl(lot.lat, lot.lng)}
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
