// cspell:disable
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@orthoplus/core-ui/card";

export function EmptyState() {
  return (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma transação crypto confirmada ainda.</p>
        <p className="text-sm mt-2">
          Confirme pagamentos para visualizar análise comparativa.
        </p>
      </CardContent>
    </Card>
  );
}
