// cspell:disable
import type { Patient } from "./types";
import { QueixaPrincipalCard } from "./QueixaPrincipalCard";
import { SinaisVitaisCard } from "./SinaisVitaisCard";
import { MedidasCard } from "./MedidasCard";
import { AvaliacaoBucalCard } from "./AvaliacaoBucalCard";
import { ObservacoesCard } from "./ObservacoesCard";

interface ExameClinicoTabProps {
  patient: Patient;
}

export function ExameClinicoTab({ patient }: ExameClinicoTabProps) {
  return (
    <div className="space-y-6">
      <QueixaPrincipalCard patient={patient} />
      <SinaisVitaisCard patient={patient} />
      <MedidasCard patient={patient} />
      <AvaliacaoBucalCard patient={patient} />
      <ObservacoesCard patient={patient} />
    </div>
  );
}
