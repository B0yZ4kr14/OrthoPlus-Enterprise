import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { useTISSGlosas } from "@/modules/tiss/application/hooks/useTISSGlosas";
import { formatDate } from "@/lib/utils/date.utils";
import { getStatusColor } from "@/lib/utils/status.utils";
import { RotateCcw } from "lucide-react";

export function TISSGlosaList() {
  const { glosas, isLoading, reprocessarGlosa, isReprocessing } = useTISSGlosas();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Glosas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando glosas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Glosas ({glosas.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {glosas.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma glosa registrada.</p>
        ) : (
          <div className="space-y-4">
            {glosas.map((guide: any) => (
              <div
                key={guide.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">Guia {guide.guide_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {guide.insurance_company} • {guide.procedure_name}
                  </p>
                  {guide.glosa_reason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Motivo: {guide.glosa_reason}
                    </p>
                  )}
                  {guide.glosa_date && (
                    <p className="text-xs text-muted-foreground">
                      Data: {formatDate(guide.glosa_date)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold">
                      R$ {((guide.glosa_amount || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant={getStatusColor(guide.status)}>
                      {guide.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => reprocessarGlosa(guide.id)}
                    disabled={isReprocessing}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reprocessar
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
