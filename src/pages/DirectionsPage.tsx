import { useEffect, useMemo, useState } from 'react';
import { fetchCompanyById } from '../lib/companies';
import { fetchPublicReceipt } from '../lib/receipt';
import type { ReceiptPublic } from '../types/receipt';
import { itchaHandoffPlace } from '../data/itchaPickup';
import { visibleParkingProducts } from '../utils/parkingProducts';
import {
  DIRECTIONS_PLACES,
  findDirectionsPlace,
  HANDOFF_PAGE,
  handoffPlainLabel,
  kakaoDirectionsUrl,
  naverDirectionsUrl,
  readDirectionsRoute,
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

function normalizeTerminal(raw?: string): DirectionsTerminal | null {
  const t = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
  if (t === 'T1' || t === '1' || t.includes('제1') || t.includes('1터미널')) return 'T1';
  if (t === 'T2' || t === '2' || t.includes('제2') || t.includes('2터미널')) return 'T2';
  return null;
}

function resolveHandoffFromReceipt(
  receipt: ReceiptPublic,
  companyProductsMeet: boolean,
  companyProductsDrop: boolean
): DirectionsHandoff | null {
  const itchaPlace = itchaHandoffPlace(
    receipt.companyId,
    receipt.companyName,
    receipt.departureTerminal
  );
  if (itchaPlace) return 'drop';
  if (companyProductsDrop && !companyProductsMeet) return 'drop';
  if (companyProductsMeet && !companyProductsDrop) return 'curb';
  if (companyProductsDrop) return 'drop';
  if (companyProductsMeet) return 'curb';
  return null;
}

function HubPage() {
  return (
    <div className="min-h-dvh bg-[#f4efe6] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header>
          <p className="text-[11px] font-bold text-brand">에어픽</p>
          <h1 className="mt-1 text-xl font-black text-stone-900">찾아오는 길</h1>
          <p className="mt-1 text-[13px] font-semibold leading-relaxed text-stone-600">
            예약하신 이용 방법을 골라 주세요. 알림톡 링크로 들어오시면 예약에 맞춰 자동으로
            안내됩니다.
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
      </div>
    </div>
  );
}

function HandoffPage({
  handoff,
  terminal: terminalProp,
}: {
  handoff: DirectionsHandoff;
  terminal: DirectionsTerminal | null;
}) {
  const meta = HANDOFF_PAGE[handoff];
  const [terminal, setTerminal] = useState<DirectionsTerminal | null>(terminalProp);
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

function TokenDirectionsPage({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptPublic | null>(null);
  const [handoff, setHandoff] = useState<DirectionsHandoff | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublicReceipt(token);
        if (cancelled) return;
        if (!data) {
          setError('예약을 찾을 수 없습니다. 알림톡 링크를 다시 확인해 주세요.');
          setReceipt(null);
          return;
        }
        setReceipt(data);

        let meet = false;
        let drop = false;
        if (data.companyId) {
          const company = await fetchCompanyById(data.companyId);
          if (company) {
            const products = visibleParkingProducts(company);
            meet = products.some((p) => p.meet);
            drop = products.some((p) => p.drop);
          }
        }
        if (cancelled) return;
        setHandoff(resolveHandoffFromReceipt(data, meet, drop));
      } catch {
        if (!cancelled) setError('가는 길을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const place = useMemo(() => {
    if (!receipt || !handoff) return null;
    const terminal = normalizeTerminal(receipt.departureTerminal);
    if (!terminal) return null;
    return findDirectionsPlace(handoff, terminal) ?? null;
  }, [receipt, handoff]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f4efe6] text-sm text-stone-500">
        가는 길 불러오는 중…
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f4efe6] p-4">
        <div className="max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-black text-stone-900">가는 길을 표시할 수 없습니다</p>
          <p className="mt-2 text-xs font-semibold text-stone-500">{error}</p>
          <a href="/directions" className="mt-4 inline-block text-xs font-bold text-brand underline">
            이용 방법 직접 고르기
          </a>
        </div>
      </div>
    );
  }

  const meta = handoff ? HANDOFF_PAGE[handoff] : null;

  return (
    <div className="min-h-dvh bg-[#f4efe6] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header>
          <p className="text-[11px] font-bold text-brand">에어픽 · 가는 길</p>
          <h1 className="mt-1 text-xl font-black text-stone-900">
            {meta?.headline || '찾아오는 길'}
          </h1>
          <p className="mt-1 text-[13px] font-semibold text-stone-600">
            {receipt.companyName} · {receipt.carNumber}
          </p>
        </header>

        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-stone-400">이용 방법</p>
          <p className="text-[15px] font-black text-stone-900">
            {handoff ? handoffPlainLabel(handoff) : '업체 안내에 따라 주세요'}
          </p>
          {place ? (
            <>
              <p className="text-[13px] font-bold text-stone-700">{place.howTo}</p>
              <p className="text-[12px] font-semibold text-stone-500">{place.name}</p>
            </>
          ) : (
            <p className="text-[13px] font-semibold text-stone-500">
              이 예약은 지도 목적지가 아직 없습니다. 업체에 문의해 주세요.
            </p>
          )}
        </section>

        {place ? (
          <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="mb-2 text-[11px] font-bold text-stone-400">지도 앱으로 열기</p>
            <MapButtons place={place} />
          </section>
        ) : null}

        <a
          href={`/r/${encodeURIComponent(token)}`}
          className="block text-center text-[12px] font-bold text-brand underline underline-offset-2"
        >
          접수증 보기
        </a>
      </div>
    </div>
  );
}

export default function DirectionsPage() {
  const route = useMemo(
    () => readDirectionsRoute(window.location.pathname, window.location.search),
    []
  );

  if (route.kind === 'token') {
    return <TokenDirectionsPage token={route.token} />;
  }
  if (route.kind === 'handoff') {
    return <HandoffPage handoff={route.handoff} terminal={route.terminal} />;
  }
  return <HubPage />;
}
