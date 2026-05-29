// cspell:disable
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Odontograma2D } from "@/modules/pep/components/Odontograma2D";
import { OdontogramaAIAnalysis } from "@/modules/pep/components/OdontogramaAIAnalysis";

interface OdontogramaTabProps {
  prontuarioId: string | null;
}

export function OdontogramaTab({ prontuarioId }: OdontogramaTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Odontograma 2D Interativo</CardTitle>
        <CardDescription>
          Mapeamento visual do estado dentário do paciente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {prontuarioId ? (
          <>
            <Odontograma2D prontuarioId={prontuarioId} />
            <OdontogramaAIAnalysis prontuarioId={prontuarioId} />
          </>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum prontuário associado a este paciente.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
