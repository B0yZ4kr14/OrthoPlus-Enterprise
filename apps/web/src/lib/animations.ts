import { Variants, useReducedMotion } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0, 0, 0.2, 1] } },
};

export const slideInFromTop: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
};

export function useAccessibleAnimation() {
  const shouldReduceMotion = useReducedMotion();
  return {
    variants: shouldReduceMotion ? undefined : fadeUp,
    transition: shouldReduceMotion ? { duration: 0 } : undefined,
  };
}
