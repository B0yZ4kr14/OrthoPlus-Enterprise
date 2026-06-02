import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@orthoplus/core-ui/table";
import {BudgetStatusBadge} from "./BudgetStatusBadge";
import type { Budget } from "./types";

interface BudgetsListProps {
  budgets: Budget[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDiscount(discount: number, total: number): string {
  if (discount <= 0) return "-";
  const percent = ((discount / total) * 100).toFixed(0);
  return `${formatCurrency(discount)} (${percent}%)`;
}

export function BudgetsList({ budgets }: BudgetsListProps) {
  if (budgets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum orçamento encontrado.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Desconto</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => (
            <TableRow key={budget.id}>
              <TableCell className="font-medium">{budget.number}</TableCell>
              <TableCell>{budget.date}</TableCell>
              <TableCell>{formatCurrency(budget.total)}</TableCell>
              <TableCell>
                {formatDiscount(budget.discount, budget.total)}
              </TableCell>
              <TableCell>
                <BudgetStatusBadge status={budget.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
