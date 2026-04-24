import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { DollarSign } from "lucide-react";
import type { FinanceiroTabProps } from "./types";
import { useFinanceiroTab } from "./useFinanceiroTab";
import { FinancialSummary } from "./FinancialSummary";

export function FinanceiroTab({ patient }: FinanceiroTabProps) {
  const { getPaymentStatusConfig } = useFinanceiroTab(patient.payment_status as string);
  const statusConfig = getPaymentStatusConfig((patient.payment_status as string) || "");
  const StatusIcon = statusConfig.icon;

  const totalPaid = (patient.total_paid as number) || 0;
  const totalDebt = (patient.total_debt as number) || 0;
  const balance = totalPaid - totalDebt;

  return (
    <div className="space-y-6">
      <FinancialSummary
        totalPaid={totalPaid}
        totalDebt={totalDebt}
        statusLabel={statusConfig.label}
        StatusIcon={StatusIcon}
        statusVariant={statusConfig.variant}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Informações Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Método de Pagamento Preferido
            </label>
            <p className="text-lg mt-2">
              {(patient.preferred_payment_method as string) || "Não informado"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Balanço Total</label>
            <p className={`text-2xl font-bold mt-2 ${balance < 0 ? "text-destructive" : "text-success"}`}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Histórico de pagamentos em desenvolvimento</p>
            <p className="text-sm mt-2">
              Aqui serão exibidos todos os pagamentos, orçamentos e transações do paciente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
