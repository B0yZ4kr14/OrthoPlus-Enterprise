// cspell:disable
import { Calendar } from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { tipoRadiografiaLabels } from "../../types/radiografia.types";
import type { AnaliseComplete } from "../../types/radiografia.types";

interface AnaliseCardProps {
  analise: AnaliseComplete;
  variant: "primary" | "success";
  badgeLabel: string;
}

const variantClasses = {
  primary: "border-2 border-primary/20",
  success: "border-2 border-success/20",
};

export function AnaliseCard({ analise, variant, badgeLabel }: AnaliseCardProps) {
  return (
    <Card className={`p-4 ${variantClasses[variant]}`} depth="normal">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{badgeLabel}</Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(analise.created_at ?? "").toLocaleDateString("pt-BR")}
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden bg-black/5 aspect-video">
          <img
            src={analise.imagem_url}
            alt={`Radiografia ${badgeLabel}`}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">Tipo:</span>
            <p className="text-sm font-medium">
              {tipoRadiografiaLabels[analise.tipo_radiografia as keyof typeof tipoRadiografiaLabels]}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Problemas Detectados:</span>
            <p className="text-2xl font-bold text-warning">
              {analise.problemas_detectados || 0}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Precisão da IA:</span>
            <p className="text-2xl font-bold text-primary">
              {analise.confidence_score ? Math.round(analise.confidence_score) : 0}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
