import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Badge } from "@orthoplus/core-ui/badge";
import { Card } from "@orthoplus/core-ui/card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Lightbulb,
  LucideIcon,
} from "lucide-react";
import type { AnaliseComplete, ProblemaRadiografico } from "../types/radiografia.types";
import { tipoRadiografiaLabels, tipoProblemaLabels } from "../types/radiografia.types";

interface AnaliseDetailsDialogProps {
  analise: AnaliseComplete | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnaliseDetailsDialog({
  analise,
  open,
  onOpenChange,
}: AnaliseDetailsDialogProps) {
  if (!analise) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDENTE: "text-muted-foreground",
      PROCESSANDO: "text-warning",
      CONCLUIDA: "text-success",
      ERRO: "text-destructive",
    };
    return colors[status] || "text-muted-foreground";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, LucideIcon> = {
      PENDENTE: Clock,
      PROCESSANDO: Clock,
      CONCLUIDA: CheckCircle,
      ERRO: XCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-5 w-5" />;
  };

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" | "info" | "warning" | "success" => {
    const variants: Record<string, "success" | "warning" | "destructive"> = {
      LEVE: "success",
      MODERADA: "warning",
      GRAVE: "destructive",
    };
    return variants[severity] || "default";
  };

  const problemas = analise.resultado_ia?.problemas_detectados || [];
  const sugestoes = analise.resultado_ia?.sugestoes_tratamento || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes da Análise</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card className="p-6" depth="normal">
            <dl className="grid grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">
                  Paciente
                </dt>
                <dd className="text-lg font-semibold">{analise.patient_name || "Paciente não identificado"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">
                  Data da Análise
                </dt>
                <dd className="text-lg">
                  {analise.created_at ? new Date(analise.created_at).toLocaleString("pt-BR") : "Data não disponível"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">
                  Tipo de Radiografia
                </dt>
                <dd>
                  <Badge variant="outline" className="text-sm">
                    {tipoRadiografiaLabels[analise.tipo_radiografia] || analise.tipo_radiografia}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </dt>
                <dd
                  className={`flex items-center gap-2 ${getStatusColor(analise.status_analise)}`}
                >
                  {getStatusIcon(analise.status_analise)}
                  <span className="font-medium capitalize">
                    {analise.status_analise.toLowerCase()}
                  </span>
                </dd>
              </div>
            </dl>
          </Card>

          {/* Imagem da Radiografia */}
          <Card className="p-6" depth="normal">
            <h3 className="text-lg font-semibold mb-4">Imagem Radiográfica</h3>
            <div className="relative rounded-lg overflow-hidden bg-black/5 flex justify-center">
              <img
                src={analise.imagem_url}
                alt="Radiografia clínica"
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </div>
          </Card>

          {/* Confiança da IA */}
          {analise.confidence_score !== undefined && analise.confidence_score > 0 && (
            <Card className="p-6 bg-primary/5 border-primary/20" depth="subtle">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Confiança da IA
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Nível de certeza da análise automatizada
                  </p>
                </div>
                <div className="text-4xl font-bold text-primary">
                  {Math.round(analise.confidence_score * (analise.confidence_score <= 1 ? 100 : 1))}%
                </div>
              </div>
            </Card>
          )}

          {/* Problemas Detectados */}
          {problemas.length > 0 && (
            <Card className="p-6" depth="normal">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Problemas Detectados ({problemas.length})
              </h3>
              <div className="space-y-4">
                {problemas.map((problema: ProblemaRadiografico, index: number) => (
                  <div
                    key={problema.id || index}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">
                          {tipoProblemaLabels[problema.tipo_problema] || problema.tipo_problema}
                          {problema.dente_codigo && ` - Dente ${problema.dente_codigo}`}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {problema.localizacao || "Localização não especificada"}
                        </p>
                      </div>
                      <Badge variant={getSeverityVariant(problema.severidade)}>
                        {problema.severidade}
                      </Badge>
                    </div>
                    {problema.descricao && (
                      <p className="text-sm mt-2">{problema.descricao}</p>
                    )}
                    {problema.confianca !== undefined && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Confiança: {Math.round(problema.confianca)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Sugestões de Tratamento */}
          {sugestoes.length > 0 && (
            <Card className="p-6 bg-success/5 border-success/20" depth="normal">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-success" />
                Sugestões de Tratamento ({sugestoes.length})
              </h3>
              <div className="space-y-4">
                {sugestoes.map((sugestao, index: number) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-background"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">
                        {sugestao.tratamento || "Tratamento Recomendado"}
                      </h4>
                      {sugestao.prioridade && (
                        <Badge variant="outline" className="text-xs">
                          Prioridade: {sugestao.prioridade}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sugestao.descricao}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Observações do Dentista */}
          {analise.observacoes_dentista && (
            <Card className="p-6" depth="normal">
              <h3 className="text-lg font-semibold mb-4">
                Observações do Dentista
              </h3>
              <p className="text-sm whitespace-pre-wrap">
                {analise.observacoes_dentista}
              </p>
              {analise.revisado_por_dentista && (
                <p className="text-xs text-muted-foreground mt-4">
                  Revisado pelo profissional responsável
                </p>
              )}
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
