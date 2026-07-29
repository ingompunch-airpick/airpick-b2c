import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, mktViewport } from '../lib/motion';
import { cn } from '../../utils/cn';

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
};

export function FadeIn({ children, className, delay = 0, as = 'div' }: FadeInProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    if (as === 'li') return <li className={className}>{children}</li>;
    if (as === 'section') return <section className={className}>{children}</section>;
    if (as === 'article') return <article className={className}>{children}</article>;
    return <div className={className}>{children}</div>;
  }

  const motionProps = {
    className: cn(className),
    variants: fadeUp,
    initial: 'hidden' as const,
    whileInView: 'visible' as const,
    viewport: mktViewport,
    transition: { delay },
  };

  if (as === 'li') return <motion.li {...motionProps}>{children}</motion.li>;
  if (as === 'section') return <motion.section {...motionProps}>{children}</motion.section>;
  if (as === 'article') return <motion.article {...motionProps}>{children}</motion.article>;
  return <motion.div {...motionProps}>{children}</motion.div>;
}
