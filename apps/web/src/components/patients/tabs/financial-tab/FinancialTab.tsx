import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Skeleton } from "@orthoplus/core-ui/skeleton";
import type { FinancialTabProps } from "./types";
import { useFinancialTab } from "./useFinancialTab";
import { FinancialSummary } from "./FinancialSummary";
import { BudgetsList } from "./BudgetsList";

export function FinancialTab({ patientId }: FinancialTabProps) {
  const { patient, budgets, summary, isLoading } = useFinancialTab(patientId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Dados financeiros não disponíveis.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FinancialSummary summary={summary} paymentStatus={patient.paymentStatus} />

      <Card>
        <CardHeader>
          <CardTitle>Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetsList budgets={budgets} />
        </CardContent>
      </Card>
    </div>
  );
}
