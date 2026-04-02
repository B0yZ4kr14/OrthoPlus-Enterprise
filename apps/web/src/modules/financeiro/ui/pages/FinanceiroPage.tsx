import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { useTransactions } from "../../presentation/hooks/useTransactions";
import { useCashFlow } from "../../presentation/hooks/useCashFlow";
import { useCashRegister } from "../../presentation/hooks/useCashRegister";
import { Period } from "../../domain/valueObjects/Period";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão Financeira</h1>
        <span className="text-sm text-muted-foreground">
          Período: {period.toString()}
        </span>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalReceitas)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendentes:{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(receitasPendentes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalDespesas)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendentes:{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(despesasPendentes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(saldo)}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caixa</CardTitle>
            <Wallet className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${isOpen ? "text-green-600" : "text-gray-600"}`}
            >
              {isOpen ? "ABERTO" : "FECHADO"}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentRegister
                ? `Aberto em ${new Date(currentRegister.openedAt).toLocaleDateString()}`
                : "Nenhum caixa aberto"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Navegação */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="caixa">Caixa</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              {flowLoading ? (
                <p className="text-center text-muted-foreground">
                  Carregando...
                </p>
              ) : cashFlow ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Receitas Realizadas
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(cashFlow.totalReceitas)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Despesas Realizadas
                      </p>
                      <p className="text-xl font-bold text-red-600">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(cashFlow.totalDespesas)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Saldo do Período
                      </p>
                      <p
                        className={`text-xl font-bold ${cashFlow.saldo >= 0 ? "text-green-600" : "text-red-600"}`}
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
                <p className="text-center text-muted-foreground">
                  Nenhum dado disponível
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transacoes">
          <Card>
            <CardHeader>
              <CardTitle>Transações Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de transações em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de categorias em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caixa">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de caixa em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de relatórios em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
