// cspell:disable
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils/date.utils";
import type { PedidoAutomatico } from "./types";

interface PedidosRecentesProps {
  pedidos: PedidoAutomatico[];
}

export function PedidosRecentes({ pedidos }: PedidosRecentesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pedidos Recentes</CardTitle>
        <CardDescription>
          Últimos pedidos automáticos processados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pedidos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pedido automático encontrado</p>
            </div>
          ) : (
            pedidos.slice(0, 10).map((pedido) => (
              <div
                key={pedido.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {pedido.status === "confirmado" ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : pedido.status === "enviado" ? (
                    <Clock className="h-5 w-5 text-info" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium">{pedido.numero_pedido}</p>
                    <p className="text-sm text-muted-foreground">
                      {pedido.estoque_fornecedores?.nome} •{" "}
                      {formatDate(pedido.created_at, "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      pedido.status === "confirmado"
                        ? "default"
                        : pedido.status === "enviado"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {pedido.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    R$ {Number(pedido.valor_total || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
