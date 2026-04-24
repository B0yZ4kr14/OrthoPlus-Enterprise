import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { formatDate } from "@/lib/utils/date.utils";
import { getBudgetStatusBadge } from "./statusHelpers";

interface BudgetCardProps {
  budget: {
    id: string;
    titulo: string;
    numero_orcamento: string;
    created_at: string;
    status: string;
    valor_total: number;
    tipo_plano: string;
    data_expiracao?: string;
    descricao?: string;
  };
}

export function BudgetCard({ budget }: BudgetCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{budget.titulo}</CardTitle>
            <CardDescription>
              Nº {budget.numero_orcamento} •{" "}
              {formatDate(budget.created_at)}
            </CardDescription>
          </div>
          {getBudgetStatusBadge(budget.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Valor Total:</span> R${" "}
            {budget.valor_total.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </div>
          <div>
            <span className="font-semibold">Tipo de Plano:</span> {budget.tipo_plano}
          </div>
          {budget.data_expiracao && (
            <div>
              <span className="font-semibold">Validade:</span>{" "}
              {formatDate(budget.data_expiracao)}
            </div>
          )}
        </div>
        {budget.descricao && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">{budget.descricao}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
