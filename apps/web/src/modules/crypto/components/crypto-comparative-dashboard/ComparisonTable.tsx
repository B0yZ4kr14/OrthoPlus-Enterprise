// cspell:disable
import { Badge } from "@orthoplus/core-ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import type { ComparisonMethod, CryptoStats } from "./types";

interface ComparisonTableProps {
  data: ComparisonMethod[];
  cryptoStats: CryptoStats;
}

export function ComparisonTable({ data, cryptoStats }: ComparisonTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Análise Detalhada por Método</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Método</th>
                <th className="text-right py-3 px-4">Taxa %</th>
                <th className="text-right py-3 px-4">Taxa R$</th>
                <th className="text-right py-3 px-4">Valor Líquido</th>
                <th className="text-right py-3 px-4">Diferença vs Crypto</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const diff = item.fee - cryptoStats.totalFees;
                const isCrypto = item.method === "Crypto";

                return (
                  <tr
                    key={item.method}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="py-3 px-4 font-medium">
                      {item.method}
                      {isCrypto && (
                        <Badge variant="default" className="ml-2">
                          Atual
                        </Badge>
                      )}
                    </td>
                    <td className="text-right py-3 px-4">
                      {item.feePercentage.toFixed(2)}%
                    </td>
                    <td className="text-right py-3 px-4">
                      R${" "}
                      {item.fee.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-right py-3 px-4">
                      R${" "}
                      {item.netAmount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-right py-3 px-4">
                      {isCrypto ? (
                        <span className="text-muted-foreground">-</span>
                      ) : diff > 0 ? (
                        <span className="text-success dark:text-success font-medium">
                          -R${" "}
                          {diff.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      ) : (
                        <span className="text-destructive dark:text-destructive font-medium">
                          +R${" "}
                          {Math.abs(diff).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
