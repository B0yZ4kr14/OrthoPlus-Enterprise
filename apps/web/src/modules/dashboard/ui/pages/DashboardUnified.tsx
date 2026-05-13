/**
 * DASHBOARD UNIFICADO V5.0 - OrthoPlus Enterprise
 * Consolida 4 dashboards em 1 com abas
 * 18 KPIs criticos organizados por dominio
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle2,
  BarChart3,
  FileText,
  ShoppingCart,
  AlertTriangle,
  Stethoscope,
  Package,
  Megaphone,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { fadeUp, staggerContainer } from "@/lib/animations";

const tabItems = [
  { value: "executivo", label: "Executivo", icon: BarChart3 },
  { value: "clinico", label: "Clinico", icon: Stethoscope },
  { value: "financeiro", label: "Financeiro", icon: DollarSign },
  { value: "comercial", label: "Comercial", icon: Users },
];

const COLORS = [
  "hsl(168, 45%, 52%)",  // Premium teal
  "hsl(210, 60%, 55%)",  // Clinical blue
  "hsl(40, 42%, 61%)",   // Champagne gold
  "hsl(270, 50%, 60%)",  // Soft purple
];

const statsStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const chartsStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

function AnimatedSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : "hidden"}
      animate="visible"
      variants={reduced ? undefined : fadeUp}
      transition={reduced ? { duration: 0 } : { delay, duration: 0.4, ease: [0, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerGrid({
  children,
  variants,
  className,
}: {
  children: React.ReactNode;
  variants: typeof statsStagger;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : "hidden"}
      animate="visible"
      variants={reduced ? undefined : variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function DashboardUnified() {
  const { data, isLoading } = useDashboard();
  const [activeTab, setActiveTab] = useState("executivo");
  const reduced = useReducedMotion();

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const { stats, appointmentsData, revenueData, treatmentsByStatus } = data;

  return (
    <motion.div
      initial={reduced ? false : "hidden"}
      animate="visible"
      variants={reduced ? undefined : staggerContainer}
      className="space-y-8 min-h-screen"
    >
      <AnimatedSection delay={0}>
        <WelcomeBanner userName="Dr. Silva" />
      </AnimatedSection>

      <AnimatedSection delay={0}>
        <div className="glass-card rounded-xl p-6 mb-2">
          <PageHeader
            title="Master Dashboard"
            icon={LayoutDashboard}
            description="Visao analitica em tempo real de toda a rede OrthoPlus"
          />
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            aria-label="Categorias do dashboard"
            className="bg-slate-100/50 dark:bg-slate-800/30 rounded-full p-1 inline-flex h-auto backdrop-blur-sm border border-border/20"
          >
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative min-h-[44px] px-4 py-1.5 rounded-full border-0 bg-transparent shadow-none text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald-600 data-[state=active]:font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white dark:bg-slate-800 shadow-sm rounded-full -z-10"
                    transition={{
                      type: "spring",
                      bounce: 0.15,
                      duration: 0.5,
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 text-sm">
                  <tab.icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="executivo" className="space-y-6 mt-6">
            <StaggerGrid
              variants={statsStagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Total de Pacientes"
                  value={stats.totalPatients.toString()}
                  description="Pacientes cadastrados"
                  icon={Users}
                  variant="primary"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Consultas Hoje"
                  value={stats.todayAppointments.toString()}
                  description="Agendamentos para hoje"
                  icon={Calendar}
                  variant="default"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Receita Mensal"
                  value={`R$ ${stats.monthlyRevenue.toLocaleString("pt-BR")}`}
                  description="Faturamento do mes"
                  icon={DollarSign}
                  variant="success"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Taxa de Ocupacao"
                  value={`${Math.round(stats.occupancyRate)}%`}
                  description="Ocupacao hoje"
                  icon={Activity}
                  variant="warning"
                />
              </motion.div>
            </StaggerGrid>

            <StaggerGrid
              variants={chartsStagger}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <motion.div variants={fadeUp}>
                <Card className="chart-card-premium glass-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Visao Geral de Consultas</CardTitle>
                    <CardDescription>
                      Consultas agendadas vs realizadas por dia
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div role="img" aria-label="Gráfico de Visão Geral de Consultas: Consultas agendadas vs realizadas por dia">
                      <span className="sr-only">
                        <table>
                          <caption>Consultas agendadas vs realizadas por dia</caption>
                          <thead>
                            <tr>
                              <th>Dia</th>
                              <th>Agendadas</th>
                              <th>Realizadas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointmentsData.map((row, i) => (
                              <tr key={i}>
                                <td>{String(row.name)}</td>
                                <td>{String(row.agendadas)}</td>
                                <td>{String(row.realizadas)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </span>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={appointmentsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="agendadas" fill="hsl(168, 45%, 52%)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="realizadas" fill="hsl(158, 32%, 50%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Card className="chart-card-premium glass-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Desempenho Financeiro</CardTitle>
                    <CardDescription>Receita vs Despesas mensal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div role="img" aria-label="Gráfico de Desempenho Financeiro: Receita vs Despesas mensal">
                      <span className="sr-only">
                        <table>
                          <caption>Receita vs Despesas mensal</caption>
                          <thead>
                            <tr>
                              <th>Mês</th>
                              <th>Receita</th>
                              <th>Despesas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revenueData.map((row, i) => (
                              <tr key={i}>
                                <td>{String(row.name)}</td>
                                <td>{String(row.receita)}</td>
                                <td>{String(row.despesas)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </span>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="receita"
                            stroke="hsl(168, 45%, 52%)"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: "hsl(168, 45%, 52%)", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="despesas"
                            stroke="hsl(4, 42%, 60%)"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: "hsl(168, 45%, 52%)", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerGrid>

            <AnimatedSection delay={0.2}>
              <Card className="chart-card-premium glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Tratamentos por Status</CardTitle>
                  <CardDescription>
                    Distribuicao atual dos tratamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div role="img" aria-label="Gráfico de Tratamentos por Status: Distribuição atual dos tratamentos">
                    <span className="sr-only">
                      <table>
                        <caption>Distribuição atual dos tratamentos</caption>
                        <thead>
                          <tr>
                            <th>Status</th>
                            <th>Quantidade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {treatmentsByStatus?.map(
                            (row: unknown, index: number) => {
                              const entry = row as { name: string; value: number };
                              return (
                                <tr key={index}>
                                  <td>{String(entry.name)}</td>
                                  <td>{String(entry.value)}</td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </span>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={treatmentsByStatus}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {treatmentsByStatus?.map(
                            (_entry: unknown, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ),
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>

          <TabsContent value="clinico" className="space-y-6 mt-6">
            <StaggerGrid
              variants={statsStagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Consultas de Hoje"
                  value={stats.todayAppointments.toString()}
                  description="Agendamentos confirmados"
                  icon={Calendar}
                  variant="default"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Tratamentos Ativos"
                  value={stats.pendingTreatments.toString()}
                  description="Em andamento"
                  icon={FileText}
                  variant="warning"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Tratamentos Concluidos"
                  value={stats.completedTreatments.toString()}
                  description="Finalizados este mes"
                  icon={CheckCircle2}
                  variant="success"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Taxa de Comparecimento"
                  value={`${Math.round(stats.occupancyRate)}%`}
                  description="Pacientes compareceram"
                  icon={Activity}
                  variant="primary"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Novos Pacientes"
                  value="47"
                  description="Este mes"
                  icon={Users}
                  variant="success"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Procedimentos/Dia"
                  value="12"
                  description="Media diaria"
                  icon={Activity}
                  variant="default"
                />
              </motion.div>
            </StaggerGrid>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-6 mt-6">
            <StaggerGrid
              variants={statsStagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Receita Mensal"
                  value={`R$ ${stats.monthlyRevenue.toLocaleString("pt-BR")}`}
                  description="Faturamento do mes"
                  icon={DollarSign}
                  variant="success"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Contas a Receber"
                  value="R$ 45.300"
                  description="A vencer este mes"
                  icon={FileText}
                  variant="warning"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Inadimplencia"
                  value="R$ 8.200"
                  description="Pagamentos atrasados"
                  icon={AlertTriangle}
                  variant="danger"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Ticket Medio"
                  value="R$ 850"
                  description="Por paciente"
                  icon={TrendingUp}
                  variant="primary"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Vendas PDV"
                  value="R$ 12.400"
                  description="Vendas do mes"
                  icon={ShoppingCart}
                  variant="success"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Formas de Pagamento"
                  value="6 ativas"
                  description="PIX, Cartao, Cripto"
                  icon={DollarSign}
                  variant="default"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Taxa de Conversao"
                  value="68%"
                  description="Orcamentos aprovados"
                  icon={CheckCircle2}
                  variant="success"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Valor em Estoque"
                  value="R$ 23.500"
                  description="Materiais disponiveis"
                  icon={Package}
                  variant="default"
                />
              </motion.div>
            </StaggerGrid>
          </TabsContent>

          <TabsContent value="comercial" className="space-y-6 mt-6">
            <StaggerGrid
              variants={statsStagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Leads Ativos"
                  value="124"
                  description="Prospects no funil"
                  icon={Users}
                  variant="primary"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Taxa de Conversao"
                  value="68%"
                  description="Leads -> Pacientes"
                  icon={TrendingUp}
                  variant="success"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="CAC (Custo Aquisicao)"
                  value="R$ 180"
                  description="Por novo paciente"
                  icon={DollarSign}
                  variant="warning"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="ROI de Marketing"
                  value="340%"
                  description="Retorno sobre investimento"
                  icon={Megaphone}
                  variant="success"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Campanhas Ativas"
                  value="7"
                  description="Em execucao"
                  icon={Megaphone}
                  variant="default"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Taxa de Abertura"
                  value="42%"
                  description="E-mails de campanha"
                  icon={Activity}
                  variant="primary"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="Recalls Pendentes"
                  value="89"
                  description="Pacientes para contato"
                  icon={AlertTriangle}
                  variant="warning"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatsCard
                  title="NPS (Satisfacao)"
                  value="8.7"
                  description="De 10.0"
                  icon={CheckCircle2}
                  variant="success"
                />
              </motion.div>
            </StaggerGrid>
          </TabsContent>
        </Tabs>
      </AnimatedSection>
    </motion.div>
  );
}
