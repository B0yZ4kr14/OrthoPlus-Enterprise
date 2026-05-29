import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

interface FinancialSummaryProps {
  totalPaid: number;
  totalDebt: number;
  statusLabel: string;
  StatusIcon: LucideIcon;
  statusVariant: "default" | "warning" | "destructive" | "outline";
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string;
  icon: typeof TrendingUp;
  colorClass: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colorClass}`} />
          <span className={`text-3xl font-bold ${colorClass}`}>{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialSummary({
  totalPaid,
  totalDebt,
  statusLabel,
  StatusIcon,
  statusVariant,
}: FinancialSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard
        title="Total Pago"
        value={`R$ ${totalPaid.toFixed(2)}`}
        icon={TrendingUp}
        colorClass="text-success"
      />
      <SummaryCard
        title="Total em Débito"
        value={`R$ ${totalDebt.toFixed(2)}`}
        icon={TrendingDown}
        colorClass="text-destructive"
      />
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Status de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={statusVariant} className="text-base py-2 px-4 gap-2">
            <StatusIcon className="h-4 w-4" />
            {statusLabel}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
