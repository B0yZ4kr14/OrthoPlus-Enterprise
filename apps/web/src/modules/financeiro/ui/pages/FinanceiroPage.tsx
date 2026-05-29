import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { useTransactions } from "../../presentation/hooks/useTransactions";
import { useCashFlow } from "../../presentation/hooks/useCashFlow";
import { useCashRegister } from "../../presentation/hooks/useCashRegister";
import { Period } from "../../domain/valueObjects/Period";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  List,
  Tags,
  Archive,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { CardTopBorder } from "@/components/shared/CardTopBorder";

export function FinanceiroPage() {
  const [period] = useState(Period.currentMonth());
  const {
    totalReceitas,
    totalDespesas,
    receitasPendentes,
    despesasPendentes,
    saldo,
  } = useTransactions();
  const { cashFlow, loading: flowLoading } = useCashFlow(period);
  const { currentRegister, isOpen } = useCashRegister();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Wallet}
        title="Gestão Financeira"
        description="Controle completo de receitas, despesas e fluxo de caixa"
        actions={
          <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
            Período: {period.toString()}
          </span>
        }
      />

      {/* Cards de Resumo Premium */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Receitas"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalReceitas)}
          icon={TrendingUp}
          variant="success"
          description={`Pendentes: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(receitasPendentes)}`}
        />
        <StatsCard
          title="Despesas"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalDespesas)}
          icon={TrendingDown}
          variant="danger"
          description={`Pendentes: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(despesasPendentes)}`}
        />
        <StatsCard
          title="Saldo"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(saldo)}
          icon={DollarSign}
          variant={saldo >= 0 ? "success" : "danger"}
          description="Receitas − Despesas"
        />
        <StatsCard
          title="Caixa"
          value={isOpen ? "ABERTO" : "FECHADO"}
          icon={Wallet}
          variant={isOpen ? "success" : "default"}
          description={
            currentRegister
              ? `Aberto em ${new Date(currentRegister.openedAt).toLocaleDateString()}`
              : "Nenhum caixa aberto"
          }
        />
      </div>

      {/* Abas de Navegação Premium */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl p-1">
          <TabsTrigger
            value="dashboard"
            className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="transacoes"
            className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground"
          >
            <List className="h-4 w-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger
            value="categorias"
            className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground"
          >
            <Tags className="h-4 w-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger
            value="caixa"
            className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground"
          >
            <Archive className="h-4 w-4" />
            Caixa
          </TabsTrigger>
          <TabsTrigger
            value="relatorios"
            className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground"
          >
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 mt-6">
          <Card className="glass-card overflow-hidden">
            <CardTopBorder color="interactive" opacity={40} />
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Fluxo de Caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flowLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-interactive" />
                </div>
              ) : cashFlow ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-card rounded-xl p-4 border-l-4 border-l-success">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Receitas Realizadas
                      </p>
                      <p className="text-xl font-bold text-success">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(cashFlow.totalReceitas)}
                      </p>
                    </div>
                    <div className="glass-card rounded-xl p-4 border-l-4 border-l-destructive">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Despesas Realizadas
                      </p>
                      <p className="text-xl font-bold text-destructive">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(cashFlow.totalDespesas)}
                      </p>
                    </div>
                    <div className="glass-card rounded-xl p-4 border-l-4 border-l-interactive">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Saldo do Período
                      </p>
                      <p
                        className={`text-xl font-bold ${cashFlow.saldo >= 0 ? "text-success" : "text-destructive"}`}
                      >
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(cashFlow.saldo)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  message="Nenhum dado disponível"
                  description="O fluxo de caixa do período será exibido aqui."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transacoes" className="mt-6">
          <Card className="glass-card overflow-hidden">
            <CardTopBorder color="warning" opacity={40} />
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Transações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={List}
                message="Em desenvolvimento"
                description="A funcionalidade de transações está sendo implementada."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="mt-6">
          <Card className="glass-card overflow-hidden">
            <CardTopBorder color="warning" opacity={40} />
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Categorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Tags}
                message="Em desenvolvimento"
                description="A funcionalidade de categorias está sendo implementada."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caixa" className="mt-6">
          <Card className="glass-card overflow-hidden">
            <CardTopBorder color="warning" opacity={40} />
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Controle de Caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Archive}
                message="Em desenvolvimento"
                description="A funcionalidade de caixa está sendo implementada."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="mt-6">
          <Card className="glass-card overflow-hidden">
            <CardTopBorder color="warning" opacity={40} />
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={FileText}
                message="Em desenvolvimento"
                description="A funcionalidade de relatórios está sendo implementada."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
