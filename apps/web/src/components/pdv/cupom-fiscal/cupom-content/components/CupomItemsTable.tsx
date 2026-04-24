import type { CupomFiscalProps } from "../../types";
import { useCurrencyFormatter } from "../hooks/useCurrencyFormatter";

interface CupomItemsTableProps {
  items: CupomFiscalProps["items"];
}

export function CupomItemsTable({ items }: CupomItemsTableProps) {
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <table>
      <thead>
        <tr>
          <td className="bold">ITEM</td>
          <td className="bold right">QTD</td>
          <td className="bold right">VALOR</td>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            <td colSpan={3}>
              <div>{(item as Record<string, any>).descricao}</div>
              <div className="flex justify-between">
                <span>{(item as Record<string, any>).quantidade} x</span>
                <span>
                  {formatCurrency((item as Record<string, any>).valor_unitario)}
                </span>
                <span className="bold">
                  {formatCurrency(
                    (item as Record<string, any>).valor_unitario *
                      (item as Record<string, any>).quantidade
                  )}
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
