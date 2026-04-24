import { Card, CardContent } from "@orthoplus/core-ui/card";
import { ClipboardPlus } from "lucide-react";

export function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <ClipboardPlus className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">
          Nenhum plano de tratamento registrado ainda.
          <br />
          Clique em "Novo Tratamento" para começar.
        </p>
      </CardContent>
    </Card>
  );
}
