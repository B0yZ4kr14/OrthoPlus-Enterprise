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
import { AnexosUpload } from "@/modules/pep/components/AnexosUpload";

interface AnexosTabProps {
  prontuarioId: string | null;
}

export function AnexosTab({ prontuarioId }: AnexosTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anexos e Documentos</CardTitle>
        <CardDescription>
          Radiografias, exames e documentos complementares
        </CardDescription>
      </CardHeader>
      <CardContent>
        {prontuarioId ? (
          <AnexosUpload prontuarioId={prontuarioId} />
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
