import { RESTORE_STEPS } from "./types";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {RESTORE_STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step.id <= currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step.id}
          </div>
          <span
            className={`ml-2 text-sm ${
              step.id <= currentStep
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {step.label}
          </span>
          {index < RESTORE_STEPS.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-2 ${
                step.id < currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
