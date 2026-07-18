import { ClipboardList, LayoutGrid, MapPinned, Smartphone } from 'lucide-react';
import type { AppTab } from '../types';
import { ESIM_TAB_LABEL, PARKING_TAB_LABEL, SPOTS_TAB_LABEL } from '../constants/marketing';
import { pathFromTab } from '../utils/appPath';
import { cn } from '../utils/cn';

const tabs: { id: AppTab; label: string; icon: typeof MapPinned }[] = [
  { id: 'home', label: SPOTS_TAB_LABEL, icon: MapPinned },
  { id: 'compare', label: PARKING_TAB_LABEL, icon: LayoutGrid },
  { id: 'esim', label: ESIM_TAB_LABEL, icon: Smartphone },
  { id: 'my', label: '예약', icon: ClipboardList },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-sky-border bg-sky-bg/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const href = pathFromTab(id);
          return (
            <a
              key={id}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onChange(id);
              }}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors',
                isActive ? 'text-brand' : 'text-muted-light'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
