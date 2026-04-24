// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { VendedorData } from "./types";

interface VendedoresTabProps {
  data: VendedorData[];
}

export function VendedoresTab({ data }: VendedoresTabProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance por Vendedor</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vendedor" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              name="Valor Total"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quantidade de Vendas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vendedor" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="quantidade"
              fill="hsl(var(--success))"
              name="Vendas"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
