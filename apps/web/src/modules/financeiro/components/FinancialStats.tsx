import { DollarSign, Clock, ShoppingCart, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { formatCurrency } from "@/lib/utils/formatting.utils";
import { FinancialSummary } from "../types/financeiro.types";

interface FinancialStatsProps {
  summary: FinancialSummary;
}

function buildTrend(change: number, positive?: boolean) {
  return {
    value: change,
    label: "vs mês anterior",
    isPositive: positive ?? change > 0,
  };
}

export function FinancialStats({ summary }: FinancialStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Receita Total"
        value={formatCurrency(summary.totalRevenue)}
        trend={buildTrend(summary.revenueChange)}
        icon={DollarSign}
        variant="primary"
      />
      <StatsCard
        title="Pagamentos Pendentes"
        value={formatCurrency(summary.pendingPayments)}
        trend={buildTrend(summary.paymentsChange, false)}
        icon={Clock}
        variant="warning"
      />
      <StatsCard
        title="Despesas"
        value={formatCurrency(summary.totalExpenses)}
        trend={buildTrend(summary.expensesChange, false)}
        icon={ShoppingCart}
        variant="danger"
      />
      <StatsCard
        title="Lucro Líquido"
        value={formatCurrency(summary.netProfit)}
        trend={buildTrend(summary.profitChange)}
        icon={TrendingUp}
        variant="success"
      />
    </div>
  );
}
