import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { useFinanceiro } from "../../application/hooks/useFinanceiro";
import { TrendingUp, TrendingDown, Calculator, ArrowDown, ArrowUp, Minus } from "lucide-react";
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function DRECard({
  title,
  value,
  icon: Icon,
  variant = "neutral",
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  variant?: "positive" | "negative" | "neutral";
  description?: string;
}) {
  const variantClasses = {
    positive: "border-l-4 border-emerald-500",
    negative: "border-l-4 border-red-500",
    neutral: "border-l-4 border-blue-500",
  };

  return (
    <Card className={variantClasses[variant]}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(value)}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DREPage() {
  const { getDashboardData, loading } = useFinanceiro();
  const dashboard = getDashboardData();
  const dre = dashboard?.dre;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Calculator} title="DRE" description="Demonstração do Resultado do Exercício" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Calculator}
        title="DRE"
        description="Demonstração do Resultado do Exercício"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DRECard
          title="Receita Bruta"
          value={dre?.receitaBruta ?? 0}
          icon={TrendingUp}
          variant="positive"
          description="Total de receitas no período"
        />
        <DRECard
          title="Deduções"
          value={dre?.deducoes ?? 0}
          icon={Minus}
          variant="negative"
          description="Impostos e descontos sobre receita"
        />
        <DRECard
          title="Receita Líquida"
          value={dre?.receitaLiquida ?? 0}
          icon={ArrowDown}
          variant="positive"
          description="Receita bruta menos deduções"
        />
        <DRECard
          title="Despesas Operacionais"
          value={dre?.despesasOperacionais ?? 0}
          icon={ArrowUp}
          variant="negative"
          description="Custos operacionais do período"
        />
        <DRECard
          title="Despesas Financeiras"
          value={dre?.despesasFinanceiras ?? 0}
          icon={TrendingDown}
          variant="negative"
          description="Juros e custos financeiros"
        />
        <DRECard
          title="Lucro Líquido"
          value={dre?.lucroLiquido ?? 0}
          icon={Calculator}
          variant={dre && dre.lucroLiquido >= 0 ? "positive" : "negative"}
          description="Resultado final do exercício"
        />
      </div>
    </div>
  );
}
