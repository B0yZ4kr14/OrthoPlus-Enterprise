// cspell:disable
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@orthoplus/core-ui/card";

export function LoadingState() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Carregando odontograma...</p>
        </div>
      </CardContent>
    </Card>
  );
}
