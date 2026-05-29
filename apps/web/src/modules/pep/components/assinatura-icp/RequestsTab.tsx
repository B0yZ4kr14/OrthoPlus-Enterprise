// cspell:disable
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Send } from "lucide-react";

export function RequestsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações de Assinatura</CardTitle>
        <CardDescription>
          Gerenciar solicitações enviadas e recebidas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Gestão de solicitações de assinatura</p>
          <p className="text-sm mt-2">
            Enviar, acompanhar e lembrar signatários
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
