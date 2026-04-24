// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { ProdutoPerda } from "./types";

interface RankingListProps {
  produtos: ProdutoPerda[];
}

export function RankingList({ produtos }: RankingListProps) {
  return (
    <Card className="p-6" depth="normal">
      <h3 className="text-lg font-semibold mb-4">
        Top 10 Produtos com Maiores Perdas
      </h3>
      <div className="space-y-4">
        {produtos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma divergência registrada
          </p>
        ) : (
          produtos.map((produto, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className="w-8 h-8 flex items-center justify-center"
                >
                  {index + 1}
                </Badge>
                <div>
                  <p className="font-medium">{produto.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {produto.quantidade} unidades
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-destructive">
                  R$ {produto.perda.toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
