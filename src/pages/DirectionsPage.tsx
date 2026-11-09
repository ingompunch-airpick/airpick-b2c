import { useMemo, useState } from 'react';
import {
  DIRECTIONS_PLACES,
  findDirectionsPlace,
  HANDOFF_PAGE,
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
        <p className="mt-1 text-[13px] font-bold leading-snug text-stone-700">{place.howTo}</p>
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

function HubPage() {
  return (
    <div className="min-h-dvh bg-[#f4efe6] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header>
          <p className="text-[11px] font-bold text-brand">에어픽</p>
          <h1 className="mt-1 text-xl font-black text-stone-900">찾아오는 길</h1>
          <p className="mt-1 text-[13px] font-semibold leading-relaxed text-stone-600">
            예약하신 이용 방법을 골라 주세요. 예약 번호는 필요 없습니다.
          </p>
        </header>

        <a
          href={HANDOFF_PAGE.drop.path}
          className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-sm active:scale-[0.99]"
        >
          <p className="text-[11px] font-bold text-brand">방법 1</p>
          <p className="mt-1 text-[16px] font-black text-stone-900">
            {HANDOFF_PAGE.drop.choiceLabel}
          </p>
          <p className="mt-1 text-[12px] font-semibold leading-snug text-stone-500">
            가유·시즌·안녕 등 · 단기주차장에 세운 뒤 내립니다.
          </p>
        </a>

        <a
          href={HANDOFF_PAGE.curb.path}
          className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-sm active:scale-[0.99]"
        >
          <p className="text-[11px] font-bold text-brand">방법 2</p>
          <p className="mt-1 text-[16px] font-black text-stone-900">
            {HANDOFF_PAGE.curb.choiceLabel}
          </p>
          <p className="mt-1 text-[12px] font-semibold leading-snug text-stone-500">
            출국장 3층에서 기사님을 만납니다.
          </p>
        </a>

        <p className="text-center text-[11px] font-semibold text-stone-400">
          다른 장소에서 만나는 예약은 업체 안내에 따라 주세요.
        </p>
      </div>
    </div>
  );
}

function HandoffPage({ handoff }: { handoff: DirectionsHandoff }) {
  const meta = HANDOFF_PAGE[handoff];
  const [terminal, setTerminal] = useState<DirectionsTerminal | null>(() => {
    const initial = readDirectionsSelection(window.location.pathname, window.location.search);
    return initial.handoff === handoff ? initial.terminal : null;
  });
  const [openKey, setOpenKey] = useState<string | null>(null);

  const focused = terminal ? findDirectionsPlace(handoff, terminal) : undefined;
  const list = focused
    ? [focused]
    : DIRECTIONS_PLACES.filter((p) => p.handoff === handoff);

  return (
    <div className="min-h-dvh bg-[#f4efe6] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header>
          <a href="/directions" className="text-[11px] font-bold text-brand">
            ← 이용 방법 다시 고르기
          </a>
          <h1 className="mt-2 text-xl font-black text-stone-900">{meta.headline}</h1>
          <p className="mt-1 text-[13px] font-semibold leading-relaxed text-stone-600">
            {meta.lead}
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: null, label: '터미널 둘 다 보기' },
              { id: 'T1' as const, label: '1터미널' },
              { id: 'T2' as const, label: '2터미널' },
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
      </div>
    </div>
  );
}

export default function DirectionsPage() {
  const initial = useMemo(
    () => readDirectionsSelection(window.location.pathname, window.location.search),
    []
  );

  if (!initial.handoff) {
    return <HubPage />;
  }

  return <HandoffPage handoff={initial.handoff} />;
}
