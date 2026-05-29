// cspell:disable
import { lazy, Suspense } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";

const Odontograma3D = lazy(() =>
  import("@/modules/pep/components/Odontograma3D").then((m) => ({
    default: m.Odontograma3D,
  })),
);

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
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <Odontograma3D prontuarioId={prontuarioId} />
          </Suspense>
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
