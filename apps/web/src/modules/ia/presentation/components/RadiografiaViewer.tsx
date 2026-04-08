import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";
import { AnaliseComplete, ProblemaRadiografico } from "@/modules/ia-radiografia/types/radiografia.types";

interface RadiografiaViewerProps {
  imagemUrl: string;
  resultadoIA?: AnaliseComplete["resultado_ia"];
  confidence: number;
  tipo: string;
  onDownload?: () => void;
}

const getSeveridadeColor = (severidade: string) => {
  const colors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    LEVE: "default",
    MODERADA: "secondary",
    GRAVE: "destructive",
    baixa: "default",
    moderada: "secondary",
    alta: "default",
    crítica: "destructive",
  };
  return colors[severidade] || "default";
};

const getSeveridadeIcon = (severidade: string) => {
  const icons: Record<string, typeof AlertTriangle> = {
    LEVE: CheckCircle2,
    MODERADA: AlertCircle,
    GRAVE: AlertTriangle,
    baixa: CheckCircle2,
    moderada: AlertCircle,
    alta: AlertTriangle,
    crítica: AlertTriangle,
  };
  return icons[severidade] || AlertCircle;
};

const getQualidadeColor = (qualidade: string): "default" | "secondary" | "destructive" | "outline" => {
  const colors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    baixa: "destructive",
    regular: "secondary",
    boa: "default",
    excelente: "default",
  };
  return colors[qualidade] || "default";
};

export const RadiografiaViewer = ({
  imagemUrl,
  resultadoIA,
  confidence,
  tipo,
  onDownload,
}: RadiografiaViewerProps) => {
  const confidencePercent = (confidence * 100).toFixed(1);
  const problemas = resultadoIA?.problemas_detectados || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna Esquerda - Imagem */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Imagem da Radiografia</CardTitle>
              {onDownload && (
                <Button variant="outline" size="sm" onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border bg-black/5">
              <img
                src={imagemUrl}
                alt="Radiografia"
                className="w-full h-auto"
              />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <Badge variant="outline">{tipo}</Badge>
              </div>
              {resultadoIA?.qualidade_imagem && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Qualidade da Imagem:
                  </span>
                  <Badge
                    variant={getQualidadeColor(resultadoIA.qualidade_imagem)}
                  >
                    {resultadoIA.qualidade_imagem}
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confiança da IA:</span>
                <span className="font-medium text-foreground">
                  {confidencePercent}%
                </span>
              </div>
              {resultadoIA?.dentes_avaliados && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dentes Avaliados:</span>
                  <span className="font-medium text-foreground">
                    {resultadoIA.dentes_avaliados.length} dentes
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coluna Direita - Resultado da Análise */}
      <div className="space-y-4">
        {resultadoIA?.requer_avaliacao_especialista && (
          <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Avaliação Especializada Recomendada
                  </p>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    Esta análise requer revisão de um profissional qualificado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Problemas Detectados ({problemas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {problemas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>Nenhum problema detectado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {problemas.map((problema: ProblemaRadiografico, index: number) => {
                  const Icon = getSeveridadeIcon(problema.severidade);
                  return (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">
                                {problema.tipo_problema}
                              </p>
                              <Badge
                                variant={getSeveridadeColor(problema.severidade)}
                              >
                                {problema.severidade}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Dente(s): {problema.dente_codigo || problema.localizacao}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-foreground">
                        {problema.descricao}
                      </p>

                      {problema.sugestao_tratamento && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-1">
                            Sugestão de Tratamento:
                          </p>
                          <p className="text-sm text-foreground font-medium">
                            {problema.sugestao_tratamento}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {resultadoIA?.observacoes_ia && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações da IA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-line">
                {resultadoIA.observacoes_ia}
              </p>
            </CardContent>
          </Card>
        )}

        {resultadoIA?.dentes_avaliados && resultadoIA.dentes_avaliados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Dentes Visualizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {resultadoIA.dentes_avaliados.map((dente: number) => (
                  <Badge key={dente} variant="outline">
                    {dente}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
