import { Card, CardContent } from "@orthoplus/core-ui/card";
import { DollarSign } from "lucide-react";
import { BudgetCard } from "./BudgetCard";

interface BudgetListProps {
  budgets: Record<string, unknown>[];
}

export function BudgetList({ budgets }: BudgetListProps) {
  if (!budgets || budgets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <DollarSign className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Nenhum orçamento encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => (
        <BudgetCard key={(budget as { id: string }).id} budget={budget as any["budget"]} />
      ))}
    </div>
  );
}
