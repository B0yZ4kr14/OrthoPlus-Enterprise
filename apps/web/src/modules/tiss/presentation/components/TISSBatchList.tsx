import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { getStatusColor } from "@/lib/utils/status.utils";
import { useTISSGuides } from "@/modules/tiss/application/hooks/useTISSGuides";
import { formatDate } from "@/lib/utils/date.utils";

export function TISSBatchList() {
  const { batches, isLoading } = useTISSGuides();

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

  if (batches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lotes TISS</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum lote encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lotes TISS ({batches.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {batches.map((batch: any) => (
            <div
              key={batch.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">Lote {batch.batch_number || batch.number || batch.id}</p>
                <p className="text-sm text-muted-foreground">
                  {batch.insurance_company || batch.insurance || "-"} • {batch.guide_count || batch.guides || 0} guias
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
                    R$ {((batch.total_amount || batch.value || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
      </CardContent>
    </Card>
  );
}
