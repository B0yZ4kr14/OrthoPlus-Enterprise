import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { getStatusColor } from "@/lib/utils/status.utils";
import { useTISSGuides } from "@/modules/tiss/application/hooks/useTISSGuides";
import { formatDate } from "@/lib/utils/date.utils";

const BATCH_STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "SUBMITTED", label: "Enviado" },
  { value: "PROCESSADO", label: "Processado" },
  { value: "REJEITADO", label: "Rejeitado" },
];

export function TISSBatchList() {
  const [statusFilter, setStatusFilter] = useState("");
  const { batches, isLoading } = useTISSGuides({
    batchStatus: statusFilter || undefined,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lotes TISS</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando lotes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Lotes TISS ({batches.length})</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Filtrar por status:
          </span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {BATCH_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <p className="text-muted-foreground">Nenhum lote encontrado.</p>
        ) : (
          <div className="space-y-4">
            {batches.map((batch: any) => (
              <div
                key={batch.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    Lote {batch.batch_number || batch.number || batch.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {batch.insurance_company || batch.insurance || "-"} •{" "}
                    {batch.total_guides ||
                      batch.guide_count ||
                      batch.guides ||
                      0}{" "}
                    guias
                  </p>
                  {batch.created_at && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(batch.created_at)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold">
                      R${" "}
                      {(
                        (batch.total_amount || batch.value || 0) / 100
                      ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant={getStatusColor(batch.status)}>
                      {batch.status}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
