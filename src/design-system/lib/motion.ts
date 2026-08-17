import type { Transition, Variants } from 'framer-motion';

/** Marketing motion tokens — soft, Keynote-like */
export const mktEase = [0.22, 1, 0.36, 1] as const;

export const mktTransition: Transition = {
  duration: 0.65,
  ease: mktEase,
};

export const mktTransitionFast: Transition = {
  duration: 0.5,
  ease: mktEase,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: mktTransition,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: mktTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: mktTransition,
  },
};

/** Viewport once — skip when user prefers reduced motion (handled in FadeIn) */
export const mktViewport = { once: true, amount: 0.2 as const };
