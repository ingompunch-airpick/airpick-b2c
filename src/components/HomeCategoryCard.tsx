import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

export default function HomeCategoryCard({
  label,
  hook,
  headline,
  highlights,
  cta,
  onCta,
  icon: Icon,
  featured = false,
}: {
  label?: string;
  hook?: string;
  /** label+hook 대신 한 줄 제목 */
  headline?: string;
  highlights: readonly string[];
  cta: string;
  onCta: () => void;
  icon: LucideIcon;
  featured?: boolean;
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl shadow-card ring-1',
        featured
          ? 'bg-gradient-to-br from-[#5a9ff8] to-[#3182f6] ring-brand/20'
          : 'bg-white ring-sky-border/70 shadow-card'
      )}
    >
      {featured && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
        />
      )}

      <div className="relative p-5">
        <div className="flex items-start gap-2.5">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              featured ? 'bg-white/20' : 'bg-brand/10'
            )}
          >
            <Icon
              size={18}
              className={featured ? 'text-white' : 'text-brand'}
              strokeWidth={2.25}
            />
          </div>

          {headline ? (
            <h2
              className={cn(
                'pt-0.5 text-[1.3125rem] font-bold leading-snug tracking-tight',
                featured ? 'text-white' : 'text-ink'
              )}
            >
              {headline}
            </h2>
          ) : (
            <div className="min-w-0 pt-1">
              <span
                className={cn(
                  'text-xs font-bold tracking-wide',
                  featured ? 'text-white/90' : 'text-brand'
                )}
              >
                {label}
              </span>
              <h2
                className={cn(
                  'mt-1 text-[1.3125rem] font-bold leading-tight tracking-tight',
                  featured ? 'text-white' : 'text-ink'
                )}
              >
                {hook}
              </h2>
            </div>
          )}
        </div>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {highlights.map((item) => (
            <span
              key={item}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-bold',
                featured
                  ? 'bg-white/15 text-white ring-1 ring-white/20'
                  : 'bg-brand-soft text-ink ring-1 ring-sky-border/40'
              )}
            >
              {item}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onCta}
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5',
            'text-sm font-bold transition-all active:scale-[0.99]',
            featured
              ? 'bg-white text-brand shadow-[0_2px_12px_rgba(0,0,0,0.1)]'
              : 'bg-brand text-white hover:bg-brand-dark'
          )}
        >
          {cta}
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
}
