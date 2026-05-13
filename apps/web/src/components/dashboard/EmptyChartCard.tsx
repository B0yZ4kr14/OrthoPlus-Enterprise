import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Button } from "@orthoplus/core-ui/button";

interface EmptyChartCardProps {
  title: string;
  description: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export function EmptyChartCard({
  title,
  description,
  ctaLabel,
  onCtaClick,
}: EmptyChartCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 glass-card p-8 text-center min-h-[300px]"
      role="status"
      aria-live="polite"
    >
      <svg
        width="96"
        height="64"
        viewBox="0 0 96 64"
        fill="none"
        className="mb-4 text-slate-300"
        aria-hidden="true"
      >
        <rect
          x="4"
          y="4"
          width="88"
          height="56"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d="M16 48 L32 32 L48 40 L64 20 L80 28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="text-base font-semibold text-foreground">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
        {description}
      </p>
      {ctaLabel && onCtaClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCtaClick}
          className="mt-4 min-h-[44px]"
        >
          {ctaLabel}
        </Button>
      )}
    </motion.div>
  );
}
