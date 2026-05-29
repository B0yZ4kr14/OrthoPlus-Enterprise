import type { TourStep } from "./types";

interface TourContentProps {
  step: TourStep;
}

export function WelcomeContent() {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">Bem-vindo aos Pagamentos Cripto! 🚀</h3>
      <p className="text-sm text-muted-foreground">
        Vamos guiá-lo pelo processo completo de configuração para começar a
        receber pagamentos em Bitcoin e outras criptomoedas.
      </p>
    </div>
  );
}

export function StepContent({ step }: TourContentProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold">{step.title}</h4>
      <p className="text-sm text-muted-foreground">{step.content}</p>
    </div>
  );
}
