import { useEffect, useId, useRef, useState } from 'react';
import { fetchIcnFlightSearch, type IcnFlightSearchItem } from '../../lib/icnFlight';
import { cn } from '../../utils/cn';

const DEBOUNCE_MS = 350;
const MIN_QUERY_LEN = 2;

function normalizeFlightInput(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function formatFlightOption(f: IcnFlightSearchItem): string {
  const dest =
    f.destination && f.destinationCode
      ? `${f.destination}(${f.destinationCode})`
      : f.destination ?? f.destinationCode ?? '';
  const time = f.scheduleTime ?? f.estimatedTime ?? '—';
  const term = f.terminal ?? '';
  const parts = [f.flightId, dest, time, term].filter(Boolean);
  return parts.join(' · ');
}

export default function FlightIdCombobox({
  value,
  onChange,
  dateYmd,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  dateYmd: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<IcnFlightSearchItem[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const query = normalizeFlightInput(value);
  const canSearch = query.length >= MIN_QUERY_LEN && dateYmd.length === 8;

  useEffect(() => {
    if (!open || !canSearch) {
      setFlights([]);
      setTruncated(false);
      setSearchError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setSearchError(null);
      void fetchIcnFlightSearch(query, dateYmd).then((res) => {
        if (cancelled) return;
        setLoading(false);
        if (!res.ok) {
          setFlights([]);
          setTruncated(false);
          setSearchError(res.data?.message ?? '편명 검색에 실패했습니다.');
          return;
        }
        const matched = (res.data.flights ?? []).filter((f) =>
          String(f.flightId ?? '')
            .toUpperCase()
            .startsWith(query)
        );
        setFlights(matched);
        setTruncated(!!res.data.truncated);
        setActiveIndex(matched.length ? 0 : -1);
      });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, dateYmd, canSearch, open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selectFlight = (flightId: string) => {
    onChange(flightId);
    setOpen(false);
    setActiveIndex(-1);
  };

  const showList = open && canSearch && (loading || flights.length > 0 || !!searchError);

  return (
    <div ref={rootRef} className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(normalizeFlightInput(e.target.value));
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!showList || flights.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, flights.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            selectFlight(flights[activeIndex]!.flightId);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        autoCapitalize="characters"
        spellCheck={false}
        disabled={disabled}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-xl border border-sky-border bg-sky-bg px-3.5 py-2.5 text-base font-bold uppercase tracking-wide text-ink outline-none transition-colors hover:bg-sky-soft focus:border-brand focus:ring-2 focus:ring-brand/25 placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-muted disabled:opacity-60"
      />

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-sky-border bg-white py-1 shadow-lg ring-1 ring-black/5"
        >
          {loading ? (
            <li className="px-3 py-2.5 text-[12px] font-medium text-muted">검색 중…</li>
          ) : searchError ? (
            <li className="px-3 py-2.5 text-[12px] font-medium text-amber-700">{searchError}</li>
          ) : flights.length === 0 ? (
            <li className="px-3 py-2.5 text-[12px] font-medium text-muted">
              해당 조건의 출발편이 없습니다.
            </li>
          ) : (
            flights.map((f, idx) => (
              <li key={f.flightId} role="option" aria-selected={idx === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectFlight(f.flightId)}
                  className={cn(
                    'flex w-full flex-col items-start px-3 py-2 text-left transition',
                    idx === activeIndex ? 'bg-sky-soft' : 'hover:bg-sky-soft/70'
                  )}
                >
                  <span className="text-[13px] font-bold text-ink">{formatFlightOption(f)}</span>
                  {f.airline ? (
                    <span className="text-[10px] font-medium text-muted">{f.airline}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
          {!loading && truncated && flights.length > 0 ? (
            <li className="border-t border-sky-border/50 px-3 py-2 text-[10px] font-medium text-muted">
              편명을 더 입력하면 목록을 좁힐 수 있어요.
            </li>
          ) : null}
        </ul>
      ) : null}

      {!dateYmd && open && query.length >= MIN_QUERY_LEN ? (
        <p className="mt-1 text-[10px] font-medium text-muted">출발일을 먼저 선택해 주세요.</p>
      ) : null}
    </div>
  );
}
