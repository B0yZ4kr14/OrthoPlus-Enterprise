// cspell:disable
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import type { Previsao, StatusPrevisao, Tendencia } from "./types";

interface PrevisaoCardProps {
  previsao: Previsao;
}

function getStatusIcon(status: StatusPrevisao) {
  if (status === "CRITICO")
    return <AlertTriangle className="w-5 h-5 text-destructive" />;
  if (status === "ALERTA")
    return <AlertTriangle className="w-5 h-5 text-warning" />;
  return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
}

function getTrendIcon(tendencia: Tendencia) {
  if (tendencia === "CRESCENTE")
    return <TrendingUp className="w-5 h-5 text-destructive" />;
  if (tendencia === "DECRESCENTE")
    return <TrendingDown className="w-5 h-5 text-success" />;
  return <Minus className="w-5 h-5 text-muted-foreground" />;
}

export function PrevisaoCard({ previsao }: PrevisaoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{previsao.produto}</CardTitle>
        <CardDescription>{previsao.justificativa}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Estoque Zero</p>
            <p className="text-2xl font-bold">
              {previsao.diasAteEstoqueZero} dias
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Qtd Sugerida</p>
            <p className="text-2xl font-bold">{previsao.quantidadeSugerida}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Confiança</p>
            <p className="text-2xl font-bold">
              {(previsao.confianca * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tendência</p>
            <p className="flex items-center gap-1 mt-1">
              {getTrendIcon(previsao.tendencia)}
            </p>
          </div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm">
            <strong>Recomendação:</strong> {previsao.recomendacao}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
