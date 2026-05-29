// cspell:disable
import {
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
} from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import { Separator } from "@orthoplus/core-ui/separator";
import { ComparativoPDFExport } from "../ComparativoPDFExport";
import type { AnaliseComplete } from "../../types/radiografia.types";
import type { ComparacaoData } from "./types";

interface ComparacaoStatsProps {
  analise1: AnaliseComplete;
  analise2: AnaliseComplete;
  comparacao: ComparacaoData;
}

const TENDENCIA_ICONS: Record<
  string,
  React.ElementType<{ className?: string }>
> = {
  aumentou: TrendingUp,
  piorou: TrendingUp,
  diminuiu: TrendingDown,
  melhorou: TrendingDown,
};

const getTendenciaColor = (tendencia: string, invertido = false) => {
  const positivo = invertido
    ? tendencia === "diminuiu" || tendencia === "melhorou"
    : tendencia === "aumentou" || tendencia === "melhorou";
  const negativo = invertido
    ? tendencia === "aumentou" || tendencia === "piorou"
    : tendencia === "diminuiu" || tendencia === "piorou";

  if (positivo) return "text-success";
  if (negativo) return "text-destructive";
  return "text-muted-foreground";
};

function TendenciaIcon({
  tendencia,
  invertido = false,
}: {
  tendencia: string;
  invertido?: boolean;
}) {
  const Icon = TENDENCIA_ICONS[tendencia] || Minus;
  return (
    <Icon className={`h-5 w-5 ${getTendenciaColor(tendencia, invertido)}`} />
  );
}

export function ComparacaoStats({
  analise1,
  analise2,
  comparacao,
}: ComparacaoStatsProps) {
  return (
    <Card className="p-6 bg-primary/5 border-primary/20" depth="normal">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          Análise Comparativa
        </h3>
        <ComparativoPDFExport
          analise1={analise1}
          analise2={analise2}
          comparacao={comparacao}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Período entre análises
          </p>
          <p className="text-3xl font-bold">{comparacao.diasEntre} dias</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Problemas Detectados</p>
          <div className="flex items-center gap-2">
            <TendenciaIcon
              tendencia={comparacao.problemas.tendencia}
              invertido
            />
            <span
              className={`text-3xl font-bold ${getTendenciaColor(comparacao.problemas.tendencia, true)}`}
            >
              {comparacao.problemas.valor > 0 ? "+" : ""}
              {comparacao.problemas.valor}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {comparacao.problemas.percentual}% {comparacao.problemas.tendencia}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Precisão da IA</p>
          <div className="flex items-center gap-2">
            <TendenciaIcon tendencia={comparacao.precisao.tendencia} />
            <span
              className={`text-3xl font-bold ${getTendenciaColor(comparacao.precisao.tendencia)}`}
            >
              {Number(comparacao.precisao.valor) > 0 ? "+" : ""}
              {comparacao.precisao.valor}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {comparacao.precisao.tendencia}
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            {comparacao.problemas.valor < 0 && (
              <p className="text-success font-medium">
                Evolução positiva: Redução de{" "}
                {Math.abs(comparacao.problemas.valor)} problema(s) detectado(s).
              </p>
            )}
            {comparacao.problemas.valor > 0 && (
              <p className="text-destructive font-medium">
                Atenção necessária: Aumento de {comparacao.problemas.valor}{" "}
                problema(s) detectado(s).
              </p>
            )}
            {comparacao.problemas.valor === 0 && (
              <p className="text-muted-foreground font-medium">
                Situação estável: Número de problemas manteve-se constante.
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
