import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ESIM_COUNTRIES, getEsimCountryName } from '../config/esimCountries';
import type { EsimSearch } from '../types';
import { cn } from '../utils/cn';
import {
  ESIM_DATA_PLAN_OPTIONS,
  ESIM_DAY_OPTIONS,
  ESIM_SIM_TYPE_OPTIONS,
  formatEsimDataPlan,
  formatEsimSimType,
} from '../utils/esimLabels';

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

export default function EsimSearchPanel({
  search,
  onChange,
}: {
  search: EsimSearch;
  onChange: (next: EsimSearch) => void;
}) {
  const [openSection, setOpenSection] = useState<FilterSection | null>('type');

  const toggle = (section: FilterSection) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const dayOptions = ESIM_DAY_OPTIONS.map((days) => ({
    id: days,
    label: `${days}일`,
  }));

  return (
    <div className="rounded-2xl bg-sky-soft px-4 shadow-[0_2px_12px_rgba(49,130,246,0.08)]">
      <AccordionSection
        label="유형"
        valueLabel={formatEsimSimType(search.simType)}
        open={openSection === 'type'}
        onToggle={() => toggle('type')}
        options={ESIM_SIM_TYPE_OPTIONS}
        value={search.simType}
        onSelect={(simType) => {
          onChange({ ...search, simType });
          setOpenSection('country');
        }}
      />

      <AccordionSection
        label="나라"
        valueLabel={getEsimCountryName(search.countryCode)}
        open={openSection === 'country'}
        onToggle={() => toggle('country')}
        options={ESIM_COUNTRIES.map((c) => ({ id: c.code, label: c.name }))}
        value={search.countryCode}
        onSelect={(countryCode) => {
          onChange({ ...search, countryCode });
          setOpenSection('capacity');
        }}
      />

      <AccordionSection
        label="용량"
        valueLabel={formatEsimDataPlan(search.dataPlan)}
        open={openSection === 'capacity'}
        onToggle={() => toggle('capacity')}
        options={ESIM_DATA_PLAN_OPTIONS}
        value={search.dataPlan}
        onSelect={(dataPlan) => {
          onChange({ ...search, dataPlan });
          setOpenSection('days');
        }}
      />

      <AccordionSection
        label="일수"
        valueLabel={`${search.days}일`}
        open={openSection === 'days'}
        onToggle={() => toggle('days')}
        options={dayOptions}
        value={search.days}
        onSelect={(days) => {
          onChange({ ...search, days });
          setOpenSection(null);
        }}
      />
    </div>
  );
}
