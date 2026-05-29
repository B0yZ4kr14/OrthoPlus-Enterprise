// cspell:disable
import {
  TrendingUp,
  TrendingDown,
  Award,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Badge } from "@orthoplus/core-ui/badge";
import type { BestMoment } from "./types";

interface RecommendationAlertProps {
  bestMoment: BestMoment | null;
}

export function RecommendationAlert({ bestMoment }: RecommendationAlertProps) {
  if (!bestMoment) return null;

  const getBadge = () => {
    switch (bestMoment.recommendation) {
      case "CONVERTER_AGORA":
        return (
          <Badge variant="success" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Momento Ótimo para Converter
          </Badge>
        );
      case "AGUARDAR":
        return (
          <Badge variant="secondary" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Aguardar Melhor Momento
          </Badge>
        );
      case "EXCELENTE_MOMENTO":
        return (
          <Badge variant="success" className="gap-2 animate-pulse">
            <Award className="h-4 w-4" />
            Excelente Momento! Taxa Abaixo da Máxima
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Alert className="border-primary/50 bg-primary/5">
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold mb-2">Análise de Momento de Conversão</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Taxa Atual:</span>
              <p className="font-semibold">
                R${" "}
                {bestMoment.currentRate.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Taxa Máxima (30d):</span>
              <p className="font-semibold">
                R${" "}
                {bestMoment.maxRate.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                Diferença da Máxima:
              </span>
              <p
                className={`font-semibold flex items-center gap-1 ${
                  bestMoment.percentageFromMax > 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {bestMoment.percentageFromMax > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(bestMoment.percentageFromMax).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
        <div className="shrink-0 ml-4">{getBadge()}</div>
      </AlertDescription>
    </Alert>
  );
}
