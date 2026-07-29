import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export type AccordionItem = {
  question: string;
  answer: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

export function Accordion({ items, className }: AccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn('divide-y divide-mkt-border rounded-mkt border border-mkt-border bg-white', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-mkt-ink transition hover:bg-mkt-sub/60"
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {item.question}
                <ChevronDown
                  className={cn(
                    'size-5 shrink-0 text-mkt-muted transition duration-500',
                    isOpen && 'rotate-180 text-mkt-brand'
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className={cn('px-5 pb-5 text-sm leading-relaxed text-mkt-muted', !isOpen && 'hidden')}
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
