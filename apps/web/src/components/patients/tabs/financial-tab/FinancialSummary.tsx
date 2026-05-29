import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { DollarSign, Receipt, CreditCard } from "lucide-react";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import type { FinancialSummary as SummaryData, PaymentStatus } from "./types";

interface FinancialSummaryProps {
  summary: SummaryData;
  paymentStatus: PaymentStatus;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function FinancialSummary({
  summary,
  paymentStatus,
}: FinancialSummaryProps) {
  const cards = [
    {
      title: "Total em Orçamentos",
      value: formatCurrency(summary.totalValue),
      icon: Receipt,
    },
    {
      title: "Total Pago",
      value: formatCurrency(summary.paidValue),
      icon: DollarSign,
    },
    {
      title: "Saldo Devedor",
      value: formatCurrency(summary.balance),
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Resumo Financeiro</h3>
        <PaymentStatusBadge status={paymentStatus} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
