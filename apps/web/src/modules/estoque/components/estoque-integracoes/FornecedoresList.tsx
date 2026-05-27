// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { CheckCircle, AlertCircle, Send, RefreshCw } from "lucide-react";
import type { FornecedorIntegracao, PedidoAutomatico } from "./types";

interface FornecedoresListProps {
  fornecedores: FornecedorIntegracao[];
  pedidos: PedidoAutomatico[];
  testingAPI: string | null;
  onTestarAPI: (fornecedorId: string) => void;
}

export function FornecedoresList({
  fornecedores,
  pedidos,
  testingAPI,
  onTestarAPI,
}: FornecedoresListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fornecedores com API Integrada</CardTitle>
        <CardDescription>
          Status das integrações configuradas ({fornecedores.length}{" "}
          fornecedores)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fornecedores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum fornecedor com API configurada</p>
              <p className="text-sm mt-2">
                Configure APIs de fornecedores em Cadastros
              </p>
            </div>
          ) : (
            fornecedores.map((fornecedor) => {
              const pedidosFornecedor = pedidos.filter(
                (p) => p.estoque_fornecedores?.id === fornecedor.id,
              );
              const sucessoFornecedor = pedidosFornecedor.filter(
                (p) => p.status === "confirmado",
              ).length;
              const taxaSucessoFornecedor =
                pedidosFornecedor.length > 0
                  ? (sucessoFornecedor / pedidosFornecedor.length) * 100
                  : 0;

              return (
                <div
                  key={fornecedor.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{fornecedor.nome}</h3>
                      {fornecedor.api_enabled && (
                        <Badge
                          variant="outline"
                          className="bg-success/10 text-success"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          API Ativa
                        </Badge>
                      )}
                      {fornecedor.auto_order_enabled && (
                        <Badge
                          variant="outline"
                          className="bg-info/10 text-info"
                        >
                          Pedidos Automáticos
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Endpoint:</span>{" "}
                        <span className="text-xs">
                          {fornecedor.api_endpoint || "Não configurado"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Auth:</span>{" "}
                        {fornecedor.api_auth_type || "none"}
                      </div>
                      <div>
                        <span className="font-medium">Taxa Sucesso:</span>{" "}
                        <span
                          className={
                            taxaSucessoFornecedor >= 80
                              ? "text-success"
                              : "text-destructive"
                          }
                        >
                          {taxaSucessoFornecedor.toFixed(1)}%
                        </span>{" "}
                        ({sucessoFornecedor}/{pedidosFornecedor.length})
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTestarAPI(fornecedor.id)}
                    disabled={testingAPI === fornecedor.id}
                  >
                    {testingAPI === fornecedor.id ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Testar API
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
