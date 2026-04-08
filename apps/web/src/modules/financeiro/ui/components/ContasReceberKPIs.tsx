import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@orthoplus/core-ui/card";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ContaReceber } from "@/modules/financeiro/types/financeiro-completo.types";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

interface ContasReceberKPIsProps {
  contasReceber: ContaReceber[];
}

export function ContasReceberKPIs({ contasReceber }: ContasReceberKPIsProps) {
  const totalReceber = contasReceber
    .filter((c) => c.status !== "pago" && c.status !== "cancelado")
    .reduce((sum, c) => sum + (c.valor - (c.valor_pago || 0)), 0);

  const totalAtrasado = contasReceber
    .filter((c) => c.status === "atrasado")
    .reduce((sum, c) => sum + c.valor, 0);

  const totalRecebido = contasReceber
    .filter((c) => c.status === "pago")
    .reduce((sum, c) => sum + (c.valor_pago || c.valor), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Total a Receber
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-warning">
            {formatBRL(totalReceber)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {
              contasReceber.filter(
                (c) => c.status !== "pago" && c.status !== "cancelado",
              ).length
            }{" "}
            contas pendentes
          </p>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Atrasados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">
            {formatBRL(totalAtrasado)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {contasReceber.filter((c) => c.status === "atrasado").length}{" "}
            contas vencidas
          </p>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Recebido (Mês)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-success">
            {formatBRL(totalRecebido)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {contasReceber.filter((c) => c.status === "pago").length} contas
            quitadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
