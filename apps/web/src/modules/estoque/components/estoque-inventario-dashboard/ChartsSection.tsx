// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type {
  TendenciaAcuracidade,
  PerdasMensais,
  CriticidadeItem,
} from "./types";

interface ChartsSectionProps {
  tendenciaAcuracidade: TendenciaAcuracidade[];
  perdasMensais: PerdasMensais[];
  distribuicaoCriticidade: CriticidadeItem[];
}

export function ChartsSection({
  tendenciaAcuracidade,
  perdasMensais,
  distribuicaoCriticidade,
}: ChartsSectionProps) {
  return (
    <Tabs defaultValue="tendencia" className="space-y-4">
      <TabsList>
        <TabsTrigger value="tendencia">Tendência de Acuracidade</TabsTrigger>
        <TabsTrigger value="perdas">Perdas Mensais</TabsTrigger>
        <TabsTrigger value="criticidade">Criticidade</TabsTrigger>
      </TabsList>

      <TabsContent value="tendencia">
        <Card className="p-6" depth="normal">
          <h3 className="text-lg font-semibold mb-4">
            Evolução da Acuracidade (Últimos 6 Meses)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={tendenciaAcuracidade}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
              <Line
                type="monotone"
                dataKey="acuracidade"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                name="Acuracidade (%)"
              />
              <Line
                type="monotone"
                dataKey="divergencias"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="Divergências"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </TabsContent>

      <TabsContent value="perdas">
        <Card className="p-6" depth="normal">
          <h3 className="text-lg font-semibold mb-4">
            Valor de Perdas Mensais (R$)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={perdasMensais}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
              <Bar
                dataKey="perdas"
                fill="hsl(var(--destructive))"
                name="Perdas (R$)"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </TabsContent>

      <TabsContent value="criticidade">
        <Card className="p-6" depth="normal">
          <h3 className="text-lg font-semibold mb-4">
            Distribuição de Divergências por Criticidade
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={distribuicaoCriticidade}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {distribuicaoCriticidade.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {distribuicaoCriticidade.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">
                  {item.name}: {item.value} itens
                </span>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
