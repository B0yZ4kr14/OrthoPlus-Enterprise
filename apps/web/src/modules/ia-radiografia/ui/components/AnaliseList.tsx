import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Skeleton } from "@orthoplus/core-ui/skeleton";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Scan,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { tipoRadiografiaLabels } from "@/modules/ia-radiografia/types/radiografia.types";
import type { AnaliseComplete } from "@/modules/ia-radiografia/types/radiografia.types";

interface AnaliseListProps {
  analises: AnaliseComplete[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onViewDetails: (analise: AnaliseComplete) => void;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDENTE: "text-muted-foreground",
    PROCESSANDO: "text-warning",
    CONCLUIDA: "text-success",
    ERRO: "text-destructive",
  };
  return colors[status] || "text-muted-foreground";
}

function getStatusIcon(status: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    PENDENTE: Clock,
    PROCESSANDO: Clock,
    CONCLUIDA: CheckCircle,
    ERRO: AlertCircle,
  };
  const Icon = icons[status] || Clock;
  return <Icon className="h-4 w-4" />;
}

export function AnaliseList({
  analises,
  loading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onViewDetails,
}: AnaliseListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (analises.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma análise realizada ainda</p>
        <p className="text-sm mt-2">Faça upload de um raio-X para começar</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {analises.map((analise) => (
          <div
            key={analise.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold">{analise.patient_name}</h3>
                <Badge variant="outline">
                  {
                    tipoRadiografiaLabels[
                      analise.tipo_radiografia as keyof typeof tipoRadiografiaLabels
                    ]
                  }
                </Badge>
                <div
                  className={`flex items-center gap-1 text-sm ${getStatusColor(analise.status_analise)}`}
                >
                  {getStatusIcon(analise.status_analise)}
                  <span className="capitalize">{analise.status_analise}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Data:{" "}
                  {new Date(analise.created_at ?? "").toLocaleString("pt-BR")}
                </p>
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-warning" />
                  {analise.problemas_detectados || 0} problema(s) detectado(s)
                </p>
              </div>
            </div>
            <div className="text-right space-y-2">
              {analise.confidence_score &&
                analise.confidence_score > 0 && (
                  <div>
                    <div className="text-2xl font-bold text-success">
                      {Math.round(analise.confidence_score)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Confiança da IA
                    </div>
                  </div>
                )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(analise)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver Detalhes
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}{" "}
            análises
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="min-w-[32px]"
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
