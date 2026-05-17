import { cn } from "@/lib/utils";

interface CardTopBorderProps {
  color?: "interactive" | "warning" | "success" | "destructive" | "primary";
  opacity?: number;
  className?: string;
}

export function CardTopBorder({
  color = "interactive",
  opacity = 30,
  className,
}: CardTopBorderProps) {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent to-transparent",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(to right, transparent, hsl(var(--${color})), transparent)`,
        opacity: opacity / 100,
      }}
      aria-hidden="true"
    />
  );
}
