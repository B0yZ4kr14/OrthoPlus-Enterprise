import { useCurrencyFormatter } from "../hooks/useCurrencyFormatter";

interface CupomTotalProps {
  valorTotal: number;
}

export function CupomTotal({ valorTotal }: CupomTotalProps) {
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <>
      <div className="divider"></div>

      <table>
        <tbody>
          <tr>
            <td>TOTAL</td>
            <td className="right bold text-lg">{formatCurrency(valorTotal)}</td>
          </tr>
        </tbody>
      </table>

      <div className="divider"></div>
    </>
  );
}
