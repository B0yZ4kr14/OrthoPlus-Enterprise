import { type LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@orthoplus/core-ui/card";

interface FinanceiroKPICardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  footer?: React.ReactNode;
}

export function FinanceiroKPICard({
  icon: Icon,
  label,
  value,
  valueClassName = "text-foreground",
  footer,
}: FinanceiroKPICardProps) {
  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${valueClassName}`}>{value}</div>
        {footer && (
          <p className="text-xs text-muted-foreground mt-2">{footer}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
