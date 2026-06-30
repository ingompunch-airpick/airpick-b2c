import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getEsimCountryName } from '../config/esimCountries';
import {
  getAvailableCountries,
  getAvailableDataPlans,
  getAvailableDays,
  getAvailableSimTypes,
  normalizeEsimSearch,
} from '../lib/esimCatalog';
import type { EsimSearch } from '../types';
import { cn } from '../utils/cn';
import { formatEsimDataPlan, formatEsimSimType } from '../utils/esimLabels';

type FilterSection = 'type' | 'country' | 'capacity' | 'days';

function AccordionSection<T extends string | number>({
  label,
  valueLabel,
  open,
  onToggle,
  options,
  value,
  onSelect,
}: {
  label: string;
  valueLabel: string;
  open: boolean;
  onToggle: () => void;
  options: { id: T; label: string }[];
  value: T;
  onSelect: (next: T) => void;
}) {
  return (
    <div className="border-b border-sky-border/50 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
      >
        <span className="text-sm font-bold text-ink">{label}</span>
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-brand">{valueLabel}</span>
          <ChevronDown
            size={18}
            className={cn('shrink-0 text-muted transition-transform', open && 'rotate-180')}
          />
        </span>
      </button>

      {open && (
        <ul className="pb-3">
          {options.map((opt) => {
            const selected = value === opt.id;
            return (
              <li key={String(opt.id)}>
                <button
                  type="button"
                  onClick={() => onSelect(opt.id)}
                  className={cn(
                    'flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                    selected ? 'bg-sky-deep text-brand' : 'text-ink hover:bg-sky-bg'
                  )}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StaticRow({ label, valueLabel }: { label: string; valueLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-sky-border/50 py-3.5 last:border-b-0">
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="text-sm font-semibold text-brand">{valueLabel}</span>
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
  const [openSection, setOpenSection] = useState<FilterSection | null>('capacity');

  const simTypeOptions = useMemo(
    () =>
      getAvailableSimTypes().map((id) => ({
        id,
        label: formatEsimSimType(id),
      })),
    []
  );

  const countryOptions = useMemo(
    () =>
      getAvailableCountries(search.simType).map((code) => ({
        id: code,
        label: getEsimCountryName(code),
      })),
    [search.simType]
  );

  const dataPlanOptions = useMemo(
    () =>
      getAvailableDataPlans(search.simType, search.countryCode).map((id) => ({
        id,
        label: formatEsimDataPlan(id),
      })),
    [search.simType, search.countryCode]
  );

  const dayOptions = useMemo(
    () =>
      getAvailableDays(search.simType, search.countryCode, search.dataPlan).map((days) => ({
        id: days,
        label: `${days}일`,
      })),
    [search.simType, search.countryCode, search.dataPlan]
  );

  const toggle = (section: FilterSection) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const patchSearch = (patch: Partial<EsimSearch>) => {
    onChange(normalizeEsimSearch({ ...search, ...patch }));
  };

  return (
    <div className="rounded-2xl bg-sky-soft px-4 shadow-[0_2px_12px_rgba(49,130,246,0.08)]">
      {simTypeOptions.length > 1 ? (
        <AccordionSection
          label="유형"
          valueLabel={formatEsimSimType(search.simType)}
          open={openSection === 'type'}
          onToggle={() => toggle('type')}
          options={simTypeOptions}
          value={search.simType}
          onSelect={(simType) => {
            patchSearch({ simType });
            setOpenSection('country');
          }}
        />
      ) : simTypeOptions.length === 1 ? (
        <StaticRow label="유형" valueLabel={formatEsimSimType(search.simType)} />
      ) : null}

      {countryOptions.length > 1 ? (
        <AccordionSection
          label="나라"
          valueLabel={getEsimCountryName(search.countryCode)}
          open={openSection === 'country'}
          onToggle={() => toggle('country')}
          options={countryOptions}
          value={search.countryCode}
          onSelect={(countryCode) => {
            patchSearch({ countryCode });
            setOpenSection('capacity');
          }}
        />
      ) : countryOptions.length === 1 ? (
        <StaticRow label="나라" valueLabel={getEsimCountryName(search.countryCode)} />
      ) : null}

      {dataPlanOptions.length > 1 ? (
        <AccordionSection
          label="용량"
          valueLabel={formatEsimDataPlan(search.dataPlan)}
          open={openSection === 'capacity'}
          onToggle={() => toggle('capacity')}
          options={dataPlanOptions}
          value={search.dataPlan}
          onSelect={(dataPlan) => {
            patchSearch({ dataPlan });
            setOpenSection('days');
          }}
        />
      ) : dataPlanOptions.length === 1 ? (
        <StaticRow label="용량" valueLabel={formatEsimDataPlan(search.dataPlan)} />
      ) : null}

      {dayOptions.length > 1 ? (
        <AccordionSection
          label="일수"
          valueLabel={`${search.days}일`}
          open={openSection === 'days'}
          onToggle={() => toggle('days')}
          options={dayOptions}
          value={search.days}
          onSelect={(days) => {
            patchSearch({ days });
            setOpenSection(null);
          }}
        />
      ) : dayOptions.length === 1 ? (
        <StaticRow label="일수" valueLabel={`${search.days}일`} />
      ) : null}
    </div>
  );
}
