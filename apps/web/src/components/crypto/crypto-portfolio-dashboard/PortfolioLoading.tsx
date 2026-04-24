import { Card, CardContent } from "@orthoplus/core-ui/card";
import { RefreshCw } from "lucide-react";

export function PortfolioLoading() {
  return (
    <Card depth="normal">
      <CardContent className="py-12 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Calculando portfolio...</p>
      </CardContent>
    </Card>
  );
}
