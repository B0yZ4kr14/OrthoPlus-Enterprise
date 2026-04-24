import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";

export function LoadingState() {
  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Cotações do Mercado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </CardContent>
    </Card>
  );
}
