// cspell:disable
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import type { Patient } from "./types";

interface ObservacoesCardProps {
  patient: Patient;
}

export function ObservacoesCard({ patient }: ObservacoesCardProps) {
  if (!patient.clinical_observations) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Observações Clínicas</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base whitespace-pre-wrap">
          {patient.clinical_observations}
        </p>
      </CardContent>
    </Card>
  );
}
