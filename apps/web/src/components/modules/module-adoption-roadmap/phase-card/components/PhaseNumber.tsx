import { cn } from "@/lib/utils";
import type { PhaseNumberProps } from "../types";

export function PhaseNumber({ index, isFirst }: PhaseNumberProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg",
        isFirst
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {index + 1}
    </div>
  );
}
