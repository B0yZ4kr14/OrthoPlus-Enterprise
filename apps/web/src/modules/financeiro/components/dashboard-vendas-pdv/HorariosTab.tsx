// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { HorarioData } from "./types";

interface HorariosTabProps {
  data: HorarioData[];
}

export function HorariosTab({ data }: HorariosTabProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Horários de Pico de Vendas</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hora" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend  wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="vendas"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            name="Vendas"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="valor"
            stroke="hsl(var(--success))"
            fill="hsl(var(--success))"
            fillOpacity={0.3}
            name="Valor (R$)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
