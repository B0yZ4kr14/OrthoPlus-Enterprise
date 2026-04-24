// cspell:disable
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Odontograma3D } from "@/modules/pep/components/Odontograma3D";

interface Odontograma3DTabProps {
  prontuarioId: string | null;
}

export function Odontograma3DTab({ prontuarioId }: Odontograma3DTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Odontograma 3D</CardTitle>
        <CardDescription>
          Visualização tridimensional da arcada dentária
        </CardDescription>
      </CardHeader>
      <CardContent>
        {prontuarioId ? (
          <Odontograma3D prontuarioId={prontuarioId} />
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
