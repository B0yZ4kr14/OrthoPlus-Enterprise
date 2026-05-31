// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { formatCurrency } from "@/lib/utils/validation.utils";
import type { ProdutoMaisPedido } from "./types";

interface ProdutosTableProps {
  produtos: ProdutoMaisPedido[];
}

export function ProdutosTable({ produtos }: ProdutosTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Top 10 Produtos Mais Pedidos
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Produto</th>
              <th className="text-right p-3">Quantidade Total</th>
              <th className="text-right p-3">Valor Total</th>
              <th className="text-right p-3">Preço Médio</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.nome} className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">{produto.nome}</td>
                <td className="text-right p-3">{produto.quantidade}</td>
                <td className="text-right p-3">
                  {formatCurrency(produto.valor)}
                </td>
                <td className="text-right p-3">
                  {formatCurrency(produto.valor / produto.quantidade)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
