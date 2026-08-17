import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type ContainerProps = {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
};

/** max 1280 · responsive padding px-10 / 8 / 5 */
export function Container({ children, className, narrow = false }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-5 md:px-8 lg:px-10',
        narrow ? 'max-w-[760px]' : 'max-w-[1280px]',
        className
      )}
    >
      {children}
    </div>
  );
}
