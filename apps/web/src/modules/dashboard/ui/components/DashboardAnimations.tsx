import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

export const statsStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const chartsStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export function AnimatedSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : "hidden"}
      animate="visible"
      variants={reduced ? undefined : fadeUp}
      transition={
        reduced
          ? { duration: 0 }
          : { delay, duration: 0.4, ease: [0, 0, 0.2, 1] }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({
  children,
  variants,
  className,
}: {
  children: React.ReactNode;
  variants: typeof statsStagger;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : "hidden"}
      animate="visible"
      variants={reduced ? undefined : variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
