import { motion } from "framer-motion";
import { StatsCard } from "@/components/shared/StatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
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
import { Users, Calendar, DollarSign, Activity } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { AnimatedSection, StaggerGrid, statsStagger, chartsStagger } from "./DashboardAnimations";
import type { DashboardStats } from "@orthoplus/shared-types";
import type { DashboardChartData } from "@/hooks/useDashboard";

const COLORS = [
  "hsl(168, 45%, 52%)",
  "hsl(210, 60%, 55%)",
  "hsl(40, 42%, 61%)",
  "hsl(270, 50%, 60%)",
];

interface DashboardTabExecutivoProps {
  stats: DashboardStats;
  appointmentsData: DashboardChartData[];
  revenueData: DashboardChartData[];
  treatmentsByStatus: DashboardChartData[];
}

export default function DashboardTabExecutivo({
  stats,
  appointmentsData,
  revenueData,
  treatmentsByStatus,
}: DashboardTabExecutivoProps) {
  return (
    <div className="space-y-6">
      <StaggerGrid
        variants={statsStagger}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        data-tour="dashboard-stats"
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
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Visao Geral de Consultas
              </CardTitle>
              <CardDescription>Consultas agendadas vs realizadas por dia</CardDescription>
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
                    <Legend  wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
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
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Desempenho Financeiro
              </CardTitle>
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
                    <Legend  wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
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
            <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              Tratamentos por Status
            </CardTitle>
            <CardDescription>Distribuicao atual dos tratamentos</CardDescription>
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
                    {treatmentsByStatus?.map((row: unknown, index: number) => {
                      const entry = row as { name: string; value: number };
                      return (
                        <tr key={index}>
                          <td>{String(entry.name)}</td>
                          <td>{String(entry.value)}</td>
                        </tr>
                      );
                    })}
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
                    {treatmentsByStatus?.map((_entry: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend  wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
}
