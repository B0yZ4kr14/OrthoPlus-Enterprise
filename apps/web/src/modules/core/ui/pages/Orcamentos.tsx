import { useState } from "react";
import { Plus, FileText, Send, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@orthoplus/core-ui/button";
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { useOrcamentos } from "@/modules/orcamentos/presentation/hooks/useOrcamentos";
import { formatCurrency } from "@/lib/utils/validation.utils";
import {
  statusLabels,
  tipoPlanoLabels,
} from "@/modules/orcamentos/types/orcamento.types";
import {
  Orcamento,
  StatusOrcamento,
} from "@/modules/orcamentos/domain/entities/Orcamento";
import { OrcamentoForm } from "@/components/financeiro/OrcamentoForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { toast } from "sonner";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "error"
  | "info";

export default function Orcamentos() {
  const { orcamentos, loading, enviarOrcamento, aprovarOrcamento } =
    useOrcamentos();

  const convertToTreatmentPlan = (_orcamentoId: string) => {
    toast.info("Conversão para plano de tratamento ainda não implementada");
  };

  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(
    null,
  );
  const [formOpen, setFormOpen] = useState(false);

  const getStatusVariant = (status: StatusOrcamento): BadgeVariant => {
    const variants: Record<StatusOrcamento, BadgeVariant> = {
      RASCUNHO: "default",
      PENDENTE: "secondary",
      APROVADO: "success",
      REJEITADO: "destructive",
      EXPIRADO: "destructive",
    };
    return variants[status] || "default";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">Carregando orçamentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={FileText}
          title="Orçamentos"
          description="Gestão completa de orçamentos e propostas comerciais"
        />
        <Button type="button" variant="elevated" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">
            Total de Orçamentos
          </div>
          <div className="text-3xl font-bold mt-2">{orcamentos.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">
            Aguardando Aprovação
          </div>
          <div className="text-3xl font-bold mt-2 text-warning">
            {orcamentos.filter((o) => o.status === "PENDENTE").length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Aprovados</div>
          <div className="text-3xl font-bold mt-2 text-success">
            {orcamentos.filter((o) => o.status === "APROVADO").length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Valor Total</div>
          <div className="text-3xl font-bold mt-2">
            {formatCurrency(
              orcamentos.reduce((sum, o) => sum + o.valorTotal, 0),
            )}
          </div>
        </Card>
      </div>

      {/* Lista de Orçamentos */}
      <Card className="p-6">
        <div className="space-y-4">
          {orcamentos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum orçamento encontrado</p>
              <p className="text-sm mt-2">
                Crie seu primeiro orçamento para começar
              </p>
            </div>
          ) : (
            orcamentos.map((orcamento) => (
              <div
                key={orcamento.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedOrcamento(orcamento)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{orcamento.titulo}</h3>
                    <Badge variant={getStatusVariant(orcamento.status)}>
                      {statusLabels[orcamento.status] || orcamento.status}
                    </Badge>
                    <Badge variant="outline">
                      {tipoPlanoLabels[orcamento.tipoPlano]}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Número: {orcamento.numeroOrcamento}</p>
                    <p>Paciente: N/A</p>
                    <p>
                      Validade:{" "}
                      {orcamento.dataExpiracao.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(orcamento.valorTotal)}
                    </div>
                    {(orcamento.descontoValor ?? 0) > 0 && (
                      <div className="text-sm text-muted-foreground line-through">
                        {formatCurrency(orcamento.valorSubtotal)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {orcamento.status === "RASCUNHO" && (
                      <Button type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          enviarOrcamento(orcamento.id);
                        }}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Enviar
                      </Button>
                    )}
                    {orcamento.status === "PENDENTE" && (
                      <Button type="button"
                        size="sm"
                        variant="elevated"
                        onClick={(e) => {
                          e.stopPropagation();
                          aprovarOrcamento(orcamento.id);
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aprovar
                      </Button>
                    )}
                    {orcamento.status === "APROVADO" && (
                      <Button type="button"
                        size="sm"
                        variant="elevated-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          convertToTreatmentPlan(orcamento.id);
                        }}
                      >
                        Converter em Tratamento
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
          </DialogHeader>
          <OrcamentoForm
            onSubmit={() => {
              toast.success("Orçamento criado com sucesso!");
              setFormOpen(false);
            }}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
