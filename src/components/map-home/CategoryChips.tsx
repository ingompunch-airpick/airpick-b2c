import { HOME_CATEGORIES, type HomeCategoryId } from '../../constants/homeCategories';
import { cn } from '../../utils/cn';

export default function CategoryChips({
  activeId,
  onChange,
}: {
  activeId: HomeCategoryId;
  onChange: (id: HomeCategoryId) => void;
}) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        {HOME_CATEGORIES.map((cat) => {
          const active = cat.id === activeId;
          const soon = cat.kind === 'soon';
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition',
                active
                  ? 'bg-brand text-white shadow-[0_4px_12px_rgba(49,130,246,0.35)]'
                  : soon
                    ? 'bg-white/90 text-muted ring-1 ring-sky-border/80'
                    : 'bg-white/95 text-ink ring-1 ring-sky-border/80'
              )}
            >
              {cat.label}
              {soon ? <span className="ml-1 font-semibold opacity-70">Soon</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
