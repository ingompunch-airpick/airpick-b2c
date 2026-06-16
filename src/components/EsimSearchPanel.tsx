import { ESIM_COUNTRIES } from '../config/esimCountries';
import type { EsimSearch } from '../types';
import { cn } from '../utils/cn';
import {
  ESIM_DATA_PLAN_OPTIONS,
  ESIM_DAY_OPTIONS,
  ESIM_SIM_TYPE_OPTIONS,
  ESIM_SPEED_OPTIONS,
  formatEsimSearchSummary,
} from '../utils/esimLabels';

function OptionRow<T extends string | number>({
  label,
  options,
  value,
  onChange,
  formatLabel,
}: {
  label: string;
  options: readonly T[] | { id: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  formatLabel?: (option: T) => string;
}) {
  const normalized = options.map((opt) =>
    typeof opt === 'object' ? opt : { id: opt, label: formatLabel?.(opt) ?? String(opt) }
  );

  return (
    <div>
      <p className="mb-2 text-xs font-bold text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {normalized.map((opt) => (
          <button
            key={String(opt.id)}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'rounded-xl px-3 py-2 text-xs font-bold transition-colors',
              value === opt.id ? 'bg-sky-deep text-brand' : 'bg-sky-bg text-muted'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EsimSearchPanel({
  search,
  onChange,
}: {
  search: EsimSearch;
  onChange: (next: EsimSearch) => void;
}) {
  return (
    <div className="rounded-2xl bg-sky-soft p-4 shadow-[0_2px_12px_rgba(49,130,246,0.08)]">
      <div>
        <p className="mb-2 text-xs font-bold text-muted">나라</p>
        <div className="flex flex-wrap gap-2">
          {ESIM_COUNTRIES.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => onChange({ ...search, countryCode: country.code })}
              className={cn(
                'rounded-xl px-3 py-2 text-xs font-bold transition-colors',
                search.countryCode === country.code
                  ? 'bg-sky-deep text-brand'
                  : 'bg-sky-bg text-muted'
              )}
            >
              {country.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <OptionRow
          label="요금제"
          options={ESIM_DATA_PLAN_OPTIONS}
          value={search.dataPlan}
          onChange={(dataPlan) => onChange({ ...search, dataPlan })}
        />
        <OptionRow
          label="속도"
          options={ESIM_SPEED_OPTIONS}
          value={search.speed}
          onChange={(speed) => onChange({ ...search, speed })}
        />
        <OptionRow
          label="일수"
          options={ESIM_DAY_OPTIONS}
          value={search.days}
          onChange={(days) => onChange({ ...search, days })}
          formatLabel={(days) => `${days}일`}
        />
        <OptionRow
          label="유형"
          options={ESIM_SIM_TYPE_OPTIONS}
          value={search.simType}
          onChange={(simType) => onChange({ ...search, simType })}
        />
      </div>

      <p className="mt-3 text-center text-[11px] font-semibold text-muted">
        {formatEsimSearchSummary(search)}
      </p>
    </div>
  );
}
