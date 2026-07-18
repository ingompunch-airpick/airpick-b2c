import { Search } from 'lucide-react';

export default function HomeSearchBar({
  value,
  onChange,
  placeholder = '주차장 · 주차대행 · eSIM 검색',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2.5 shadow-[0_4px_16px_rgba(49,130,246,0.12)] ring-1 ring-sky-border/70 backdrop-blur">
      <Search size={18} className="shrink-0 text-brand" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted-light"
        enterKeyHint="search"
      />
    </label>
  );
}
