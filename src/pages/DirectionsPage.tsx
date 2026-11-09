import { useMemo, useState } from 'react';
import {
  DIRECTIONS_PLACES,
  findDirectionsPlace,
  kakaoDirectionsUrl,
  naverDirectionsUrl,
  readDirectionsSelection,
  tmapDirectionsUrl,
  type DirectionsHandoff,
  type DirectionsPlace,
  type DirectionsTerminal,
} from '../utils/directionsPlaces';

function MapButtons({ place }: { place: DirectionsPlace }) {
  const buttons = [
    { id: 'naver', label: '네이버 지도', href: naverDirectionsUrl(place) },
    { id: 'kakao', label: '카카오맵', href: kakaoDirectionsUrl(place) },
    { id: 'tmap', label: '티맵', href: tmapDirectionsUrl(place) },
  ];
  return (
    <div className="space-y-2">
      {buttons.map((b) => (
        <a
          key={b.id}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-xl border border-stone-200 bg-stone-50 py-3 text-sm font-black text-stone-900 active:scale-[0.99]"
        >
          {b.label}
        </a>
      ))}
    </div>
  );
}

function PlaceCard({
  place,
  expanded,
  onToggle,
}: {
  place: DirectionsPlace;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(place.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('주소 복사', place.address);
    }
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <button type="button" onClick={onToggle} className="w-full text-left">
        <p className="text-[11px] font-bold text-brand">{place.title}</p>
        <p className="mt-1 text-[15px] font-black leading-snug text-stone-900">{place.name}</p>
        <p className="mt-1 text-[12px] font-semibold leading-snug text-stone-500">{place.address}</p>
        <p className="mt-2 text-[11px] font-bold text-stone-400">
          {expanded ? '접기' : '지도 앱으로 길찾기'}
        </p>
      </button>
      {expanded ? (
        <div className="mt-3 space-y-3 border-t border-stone-100 pt-3">
          <button
            type="button"
            onClick={() => void copy()}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-[11px] font-black text-stone-800"
          >
            {copied ? '복사됨' : '주소 복사'}
          </button>
          <MapButtons place={place} />
        </div>
      ) : null}
    </section>
  );
}

export default function DirectionsPage() {
  const initial = useMemo(
    () => readDirectionsSelection(window.location.pathname, window.location.search),
    []
  );
  const [handoff, setHandoff] = useState<DirectionsHandoff | null>(initial.handoff);
  const [terminal, setTerminal] = useState<DirectionsTerminal | null>(initial.terminal);
  const [openKey, setOpenKey] = useState<string | null>(() => {
    if (initial.handoff && initial.terminal) return `${initial.handoff}-${initial.terminal}`;
    return null;
  });

  const focused =
    handoff && terminal ? findDirectionsPlace(handoff, terminal) : undefined;

  const list = focused
    ? [focused]
    : handoff
      ? DIRECTIONS_PLACES.filter((p) => p.handoff === handoff)
      : DIRECTIONS_PLACES;

  return (
    <div className="min-h-dvh bg-[#f4efe6] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header>
          <p className="text-[11px] font-bold text-brand">에어픽</p>
          <h1 className="mt-1 text-xl font-black text-stone-900">찾아오는 길</h1>
          <p className="mt-1 text-[12px] font-semibold text-stone-500">
            예약하신 입고 방식·터미널을 고른 뒤 지도 앱으로 길을 찾으세요. 예약 번호는 필요
            없습니다.
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: null, label: '전체' },
              { id: 'drop' as const, label: '드랍오프' },
              { id: 'curb' as const, label: '커브사이드' },
            ] as const
          ).map((opt) => (
            <button
              key={String(opt.id)}
              type="button"
              onClick={() => {
                setHandoff(opt.id);
                setTerminal(null);
                setOpenKey(null);
              }}
              className={`rounded-full px-3 py-1.5 text-[12px] font-black border ${
                handoff === opt.id
                  ? 'border-brand bg-brand text-white'
                  : 'border-stone-200 bg-white text-stone-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: null, label: '터미널 전체' },
              { id: 'T1' as const, label: 'T1' },
              { id: 'T2' as const, label: 'T2' },
            ] as const
          ).map((opt) => (
            <button
              key={String(opt.id)}
              type="button"
              onClick={() => {
                setTerminal(opt.id);
                setOpenKey(null);
              }}
              className={`rounded-full px-3 py-1.5 text-[12px] font-black border ${
                terminal === opt.id
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white text-stone-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {list.map((place) => {
            const key = `${place.handoff}-${place.terminal}`;
            return (
              <PlaceCard
                key={key}
                place={place}
                expanded={openKey === key || list.length === 1}
                onToggle={() => setOpenKey((prev) => (prev === key ? null : key))}
              />
            );
          })}
        </div>

        <p className="text-center text-[11px] font-semibold text-stone-400">
          밋앤그릿(지정 픽업)은 업체별로 안내됩니다.
        </p>
      </div>
    </div>
  );
}
