import { ExternalLink, MapPinned, Phone } from 'lucide-react';
import type { OfficialParkingLot } from '../../data/officialParkingLots';
import { buildNaverMapCoordUrl } from '../../utils/airportDistance';

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
            <button
              type="button"
              onClick={() => onSelect(lot.id)}
              className={`w-full rounded-2xl px-4 py-3.5 text-left ring-1 transition ${
                active
                  ? 'bg-brand-soft ring-brand/40'
                  : 'bg-sky-soft/80 ring-sky-border/50 hover:bg-sky-tint'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-ink">{lot.name}</p>
                <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-brand">
                  {lot.terminal}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted">{lot.description}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <a
                  href={buildNaverMapCoordUrl(lot.lat, lot.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
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
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-muted ring-1 ring-sky-border"
                  >
                    <ExternalLink size={12} />
                    공식 안내
                  </a>
                ) : null}
                {lot.phone ? (
                  <a
                    href={`tel:${lot.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-muted ring-1 ring-sky-border"
                  >
                    <Phone size={12} />
                    전화
                  </a>
                ) : null}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
