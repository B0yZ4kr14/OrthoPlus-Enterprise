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
import type { ProdutoData } from "./types";

interface ProdutosTabProps {
  data: ProdutoData[];
}

export function ProdutosTab({ data }: ProdutosTabProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Top 10 Produtos Mais Vendidos
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
          <YAxis
            dataKey="produto"
            type="category"
            width={150}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
          <Bar
            dataKey="quantidade"
            fill="hsl(var(--primary))"
            name="Quantidade"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
