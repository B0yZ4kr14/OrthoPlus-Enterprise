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
import { OdontogramaComparison } from "@/modules/pep/components/OdontogramaComparison";
import type { OdontogramaHistoryEntry } from "@/modules/pep/types/odontograma.types";

interface ComparacaoOdontoTabProps {
  prontuarioId: string | null;
  history: OdontogramaHistoryEntry[];
  selectedIds: [string | null, string | null];
  onClearSelection: () => void;
}

export function ComparacaoOdontoTab({
  prontuarioId,
  history,
  selectedIds,
  onClearSelection,
}: ComparacaoOdontoTabProps) {
  const hasBothSelected = selectedIds[0] && selectedIds[1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação de Odontogramas</CardTitle>
        <CardDescription>
          Compare duas versões do odontograma lado a lado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {prontuarioId && hasBothSelected ? (
          <OdontogramaComparison
            history={history}
            selectedIds={[selectedIds[0]!, selectedIds[1]!]}
            onClearSelection={onClearSelection}
          />
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Selecione duas versões do odontograma na aba "Histórico Odonto"
              para compará-las.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
