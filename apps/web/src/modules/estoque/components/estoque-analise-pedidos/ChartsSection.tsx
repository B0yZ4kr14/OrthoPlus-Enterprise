// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { formatCurrency } from "@/lib/utils/validation.utils";
import type {
  FornecedorHistorico,
  ProdutoMaisPedido,
  EvolucaoPedido,
  StatusDistribuicao,
} from "./types";
import { COLORS } from "./types";

interface ChartsSectionProps {
  historicoFornecedor: FornecedorHistorico[];
  produtosMaisPedidos: ProdutoMaisPedido[];
  evolucaoPedidos: EvolucaoPedido[];
  statusDistribution: StatusDistribuicao[];
}

export function ChartsSection({
  historicoFornecedor,
  produtosMaisPedidos,
  evolucaoPedidos,
  statusDistribution,
}: ChartsSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Compras por Fornecedor</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={historicoFornecedor}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="nome"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip
              formatter={(value: any) => formatCurrency(value as number)}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
            <Bar dataKey="total" fill="#0088FE" name="Valor Total" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Produtos Mais Pedidos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={produtosMaisPedidos} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="nome" type="category" width={120} fontSize={12} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
            <Bar dataKey="quantidade" fill="#00C49F" name="Quantidade" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Evolução de Pedidos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolucaoPedidos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
            <Line
              type="monotone"
              dataKey="manual"
              stroke="#FF8042"
              name="Manual"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="automatico"
              stroke="#0088FE"
              name="Automático"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#8884d8"
              name="Total"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Distribuição por Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {statusDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
