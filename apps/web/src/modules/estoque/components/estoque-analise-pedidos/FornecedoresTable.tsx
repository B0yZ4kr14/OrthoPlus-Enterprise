// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { formatCurrency } from "@/lib/utils/validation.utils";
import type { FornecedorHistorico } from "./types";

interface FornecedoresTableProps {
  fornecedores: FornecedorHistorico[];
}

export function FornecedoresTable({ fornecedores }: FornecedoresTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top 10 Fornecedores</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Fornecedor</th>
              <th className="text-right p-3">Qtd. Pedidos</th>
              <th className="text-right p-3">Valor Total</th>
              <th className="text-right p-3">Ticket Médio</th>
            </tr>
          </thead>
          <tbody>
            {fornecedores.map((fornecedor) => (
              <tr key={fornecedor.nome} className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">{fornecedor.nome}</td>
                <td className="text-right p-3">{fornecedor.quantidade}</td>
                <td className="text-right p-3">
                  {formatCurrency(fornecedor.total)}
                </td>
                <td className="text-right p-3">
                  {formatCurrency(fornecedor.total / fornecedor.quantidade)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
