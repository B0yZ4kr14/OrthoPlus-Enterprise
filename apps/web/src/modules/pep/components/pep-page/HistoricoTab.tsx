// cspell:disable
import { Plus } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { HistoricoClinicoForm } from "@/modules/pep/components/HistoricoClinicoForm";
import { EvolucoesTimeline } from "@/modules/pep/components/EvolucoesTimeline";

interface HistoricoTabProps {
  prontuarioId: string | null;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export function HistoricoTab({
  prontuarioId,
  isDialogOpen,
  onDialogOpenChange,
}: HistoricoTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Histórico Clínico & Evoluções</CardTitle>
          <CardDescription>
            Registro completo das consultas e evoluções
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Evolução
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Evolução Clínica</DialogTitle>
            </DialogHeader>
            <HistoricoClinicoForm
              prontuarioId={prontuarioId || ""}
              onSuccess={() => onDialogOpenChange(false)}
              onCancel={() => onDialogOpenChange(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {prontuarioId ? (
          <EvolucoesTimeline prontuarioId={prontuarioId} />
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
