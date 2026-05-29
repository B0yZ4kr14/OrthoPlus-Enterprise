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
import { OdontogramaHistory } from "@/modules/pep/components/OdontogramaHistory";
import type { OdontogramaHistoryEntry } from "@/modules/pep/types/odontograma.types";

interface HistoricoOdontoTabProps {
  prontuarioId: string | null;
  history: OdontogramaHistoryEntry[];
  onRestore: (id: string) => void;
  onCompare: (id: string) => void;
  selectedForComparison: string | null;
}

export function HistoricoOdontoTab({
  prontuarioId,
  history,
  onRestore,
  onCompare,
  selectedForComparison,
}: HistoricoOdontoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Alterações do Odontograma</CardTitle>
        <CardDescription>
          Versionamento completo das mudanças realizadas no odontograma ao longo
          do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {prontuarioId ? (
          <OdontogramaHistory
            history={history}
            onRestore={onRestore}
            onCompare={onCompare}
            selectedForComparison={selectedForComparison}
          />
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
