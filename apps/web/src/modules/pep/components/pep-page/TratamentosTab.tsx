// cspell:disable
import { Plus } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { PrescricaoForm } from "@/modules/pep/components/PrescricaoForm";
import { ReceitaForm } from "@/modules/pep/components/ReceitaForm";
import { TratamentoForm } from "@/modules/pep/components/TratamentoForm";

interface TratamentosTabProps {
  prontuarioId: string | null;
  dialogs: {
    prescricao: boolean;
    receita: boolean;
    tratamento: boolean;
  };
  onDialogChange: (key: "prescricao" | "receita" | "tratamento", open: boolean) => void;
}

export function TratamentosTab({
  prontuarioId,
  dialogs,
  onDialogChange,
}: TratamentosTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Planos de Tratamento</CardTitle>
          <CardDescription>
            Gestão completa dos tratamentos planejados e em andamento
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={dialogs.prescricao}
            onOpenChange={(open) => onDialogChange("prescricao", open)}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Prescrição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Nova Prescrição</DialogTitle>
              </DialogHeader>
              <PrescricaoForm
                prontuarioId={prontuarioId || ""}
                onSuccess={() => onDialogChange("prescricao", false)}
                onCancel={() => onDialogChange("prescricao", false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog
            open={dialogs.receita}
            onOpenChange={(open) => onDialogChange("receita", open)}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Receita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Nova Receita</DialogTitle>
              </DialogHeader>
              <ReceitaForm
                prontuarioId={prontuarioId || ""}
                onSuccess={() => onDialogChange("receita", false)}
                onCancel={() => onDialogChange("receita", false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog
            open={dialogs.tratamento}
            onOpenChange={(open) => onDialogChange("tratamento", open)}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tratamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Novo Plano de Tratamento</DialogTitle>
              </DialogHeader>
              <TratamentoForm
                prontuarioId={prontuarioId || ""}
                onSuccess={() => onDialogChange("tratamento", false)}
                onCancel={() => onDialogChange("tratamento", false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Listagem de tratamentos será implementada aqui
        </p>
      </CardContent>
    </Card>
  );
}
