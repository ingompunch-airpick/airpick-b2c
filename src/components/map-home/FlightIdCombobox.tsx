import { useEffect, useId, useRef, useState } from 'react';
import {
  fetchIcnFlightSearch,
  type IcnFlightDirection,
  type IcnFlightSearchItem,
} from '../../lib/icnFlight';
import { cn } from '../../utils/cn';

const DEBOUNCE_MS = 350;
const MIN_QUERY_LEN = 2;

function normalizeFlightInput(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function formatFlightOption(f: IcnFlightSearchItem, direction: IcnFlightDirection): string {
  const place =
    f.destination && f.destinationCode
      ? `${f.destination}(${f.destinationCode})`
      : f.destination ?? f.destinationCode ?? '';
  /** 도착 API의 airport = 출발지(어디발), 출발 API = 목적지 */
  const placePart = place ? (direction === 'arrival' ? `${place}발` : place) : '';
  const time = f.scheduleTime ?? f.estimatedTime ?? '—';
  const term = f.terminal ?? '';
  const parts = [f.flightId, placePart, time, term].filter(Boolean);
  return parts.join(' · ');
}

export default function FlightIdCombobox({
  value,
  onChange,
  onSelectFlight,
  dateYmd,
  direction = 'departure',
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  /** 목록에서 고르면 편명·시각·터미널이 함께 옴 */
  onSelectFlight?: (flight: IcnFlightSearchItem) => void;
  dateYmd: string;
  direction?: IcnFlightDirection;
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
  /** 검색 완료 후 0건이어도 드롭다운 유지 */
  const [searched, setSearched] = useState(false);

  const query = normalizeFlightInput(value);
  const canSearch = query.length >= MIN_QUERY_LEN && dateYmd.length === 8;
  const emptyLabel =
    direction === 'arrival'
      ? '해당 귀국일에 도착편이 없습니다. 귀국일(도착일)을 확인해 주세요.'
      : '해당 출국일에 출발편이 없습니다. 출국일을 확인해 주세요.';
  const needDateLabel =
    direction === 'arrival' ? '귀국일을 먼저 선택해 주세요.' : '출국일을 먼저 선택해 주세요.';

  useEffect(() => {
    if (!open || !canSearch) {
      setFlights([]);
      setTruncated(false);
      setSearchError(null);
      setLoading(false);
      setSearched(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setSearchError(null);
      setSearched(false);
      void fetchIcnFlightSearch(query, dateYmd, direction).then((res) => {
        if (cancelled) return;
        setLoading(false);
        setSearched(true);
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
  }, [query, dateYmd, direction, canSearch, open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selectFlight = (flight: IcnFlightSearchItem) => {
    onChange(flight.flightId);
    onSelectFlight?.(flight);
    setOpen(false);
    setActiveIndex(-1);
  };

  const showList =
    open && canSearch && (loading || searched || flights.length > 0 || !!searchError);

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
            selectFlight(flights[activeIndex]!);
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
            <li className="px-3 py-2.5 text-[12px] font-medium text-muted">{emptyLabel}</li>
          ) : (
            flights.map((f, idx) => (
              <li
                key={`${f.flightId}_${f.scheduleTime ?? ''}`}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectFlight(f)}
                  className={cn(
                    'flex w-full flex-col items-start px-3 py-2 text-left transition',
                    idx === activeIndex ? 'bg-sky-soft' : 'hover:bg-sky-soft/70'
                  )}
                >
                  <span className="text-[13px] font-bold text-ink">
                    {formatFlightOption(f, direction)}
                  </span>
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
        <p className="mt-1 text-[10px] font-medium text-muted">{needDateLabel}</p>
      ) : null}
    </div>
  );
}
