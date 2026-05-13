import { LucideIcon, Plus } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import { motion } from "framer-motion";
import { fadeUp, useAccessibleAnimation } from "@/lib/animations";

interface EmptyStatCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  onCtaClick?: () => void;
  icon: LucideIcon;
  index?: number;
}

function ToothIcon({ className }: { className?: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 12C24 12 20 8 16 12C12 16 12 24 14 28C16 32 16 36 16 40C16 44 16 52 20 56C22 58 24 56 24 52C24 48 26 44 28 44C30 44 32 48 32 52C32 56 34 58 36 56C40 52 40 44 40 40C40 36 40 32 42 28C44 24 44 16 40 12C36 8 32 12 32 12C32 12 28 8 24 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyStatCard({
  title,
  description,
  ctaLabel,
  onCtaClick,
  icon: Icon,
  index = 0,
}: EmptyStatCardProps) {
  const accessible = useAccessibleAnimation();

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.08, ...(accessible.transition || {}) }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 glass-card p-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="mb-4 text-muted-foreground/50">
        <ToothIcon className="mx-auto" />
      </div>

      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
        {title}
      </p>
      <p className="text-xs text-slate-400 mt-1">{description}</p>

      {onCtaClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCtaClick}
          className="mt-4 min-h-[44px] rounded-full border-[hsl(var(--interactive))]/30 text-[hsl(var(--interactive))] hover:bg-[hsl(var(--interactive))]/10 hover:border-[hsl(var(--interactive))]/50"
        >
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
          {ctaLabel}
        </Button>
      )}
    </motion.div>
  );
}
