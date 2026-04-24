// cspell:disable
import { CheckCircle2 } from "lucide-react";

interface ProgressIndicatorProps {
  step: number;
  totalSteps: number;
}

export function ProgressIndicator({ step, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              i + 1 === step
                ? "bg-primary text-primary-foreground"
                : i + 1 < step
                ? "bg-success text-success-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-12 h-1 mx-2 ${i + 1 < step ? "bg-success" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
