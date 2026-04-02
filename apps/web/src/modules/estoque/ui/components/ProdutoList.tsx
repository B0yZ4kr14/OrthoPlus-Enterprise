import { Package, AlertTriangle } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { Produto } from "@/domain/entities/Produto";

interface ProdutoListProps {
  produtos: Produto[];
  isLoading: boolean;
  onMovimentacao: (produtoId: string) => void;
}

export const ProdutoList = ({
  produtos,
  isLoading,
  onMovimentacao,
}: ProdutoListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (produtos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {produtos.map((produto) => {
        const estoqueBaixo =
          produto.quantidadeAtual <= produto.quantidadeMinima;
        const estoqueZerado = produto.quantidadeAtual === 0;

        return (
          <Card key={produto.id} className="relative">
            <CardContent className="pt-6">
              {/* Alertas */}
              {(estoqueBaixo || estoqueZerado) && (
                <div className="absolute top-2 right-2">
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      estoqueZerado ? "text-destructive" : "text-warning"
                    }`}
                  />
                </div>
              )}

              {/* Nome e Categoria */}
              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-lg">{produto.nome}</h3>
                <Badge variant="secondary">{produto.categoria}</Badge>
              </div>

              {/* Informações de Estoque */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span
                    className={`font-medium ${
                      estoqueZerado
                        ? "text-destructive"
                        : estoqueBaixo
                          ? "text-warning"
                          : "text-foreground"
                    }`}
                  >
                    {produto.quantidadeAtual} {produto.unidadeMedida}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mínimo:</span>
                  <span>
                    {produto.quantidadeMinima} {produto.unidadeMedida}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor Unit.:</span>
                  <span>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(produto.valorUnitario)}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onMovimentacao(produto.id)}
              >
                Movimentar
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
