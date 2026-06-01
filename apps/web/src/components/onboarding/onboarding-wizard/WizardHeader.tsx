// cspell:disable
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@orthoplus/core-ui/card";
import { Progress } from "@orthoplus/core-ui/progress";
import { CheckCircle2 } from "lucide-react";

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

interface WizardHeaderProps {
  steps: WizardStep[];
  currentStep: number;
  progress: number;
}

export function WizardHeader({
  steps,
  currentStep,
  progress,
}: WizardHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="text-center space-y-2 pr-12">
        <h1 className="text-3xl font-bold">
          Bem-vindo ao OrthoPlus{" "}
          <span className="text-primary">Enterprise</span>
        </h1>
        <p className="text-muted-foreground">
          Vamos configurar seu sistema em {steps.length} passos simples
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Passo {currentStep + 1} de {steps.length}
          </span>
          <span>{Math.round(progress)}% concluído</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="flex justify-center gap-2">
        {steps.map((s, index) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              /* no-op: step indicator is read-only */
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              index === currentStep
                ? "bg-primary text-primary-foreground scale-110"
                : index < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {index < currentStep ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <span className="text-sm font-semibold">{index + 1}</span>
            )}
          </button>
        ))}
      </div>

      {/* Current Step Title */}
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
      </Card>
    </>
  );
}
