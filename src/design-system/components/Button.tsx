import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'white';

const variants: Record<Variant, string> = {
  primary:
    'bg-mkt-brand text-white hover:bg-mkt-accent shadow-mkt hover:shadow-mkt-hover hover:scale-[1.02]',
  secondary:
    'bg-white text-mkt-ink border border-mkt-border hover:border-mkt-brand/40 hover:bg-mkt-sub',
  ghost: 'bg-transparent text-mkt-ink hover:bg-mkt-sub',
  dark: 'bg-mkt-dark text-white hover:bg-mkt-dark-card',
  white: 'bg-white text-mkt-brand hover:bg-mkt-sub',
};

function buttonClasses(variant: Variant, className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-mkt-pill px-6 py-3 text-sm font-semibold tracking-tight transition duration-500 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mkt-brand disabled:opacity-50 disabled:pointer-events-none',
    variants[variant],
    className
  );
}

type Common = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

type LinkButtonProps = Common & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  type?: never;
  disabled?: never;
};

type NativeButtonProps = Common & {
  href?: undefined;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button(props: ButtonProps) {
  const variant = props.variant ?? 'primary';
  const classes = buttonClasses(variant, props.className);

  if (props.href != null) {
    return (
      <a
        href={props.href}
        className={classes}
        target={props.target}
        rel={props.rel}
        onClick={props.onClick}
      >
        {props.children}
      </a>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      className={classes}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
