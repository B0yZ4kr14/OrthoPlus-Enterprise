// cspell:disable
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { PatientSelector } from "@/components/shared/PatientSelector";
import type { Patient } from "@/types/patient";

interface PatientSelectorCardProps {
  onSelect: (patient: Patient | null) => void;
}

export function PatientSelectorCard({ onSelect }: PatientSelectorCardProps) {
  return (
    <div className="p-8">
      <PageHeader
        title="Prontuário Eletrônico do Paciente (PEP)"
        description="Sistema completo de prontuário com odontograma 2D/3D e análise por IA"
        icon={FileText}
      />
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Selecione um Paciente</CardTitle>
          <CardDescription>
            Escolha o paciente para acessar seu prontuário eletrônico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientSelector
            onSelect={onSelect}
            placeholder="Buscar paciente por nome ou CPF..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
