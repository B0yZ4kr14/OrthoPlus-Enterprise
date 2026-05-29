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
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AppointmentDataPoint } from "./types";

interface AppointmentsChartProps {
  data: AppointmentDataPoint[];
}

export function AppointmentsChart({ data }: AppointmentsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultas da Semana</CardTitle>
        <CardDescription>Agendadas vs Realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
            <Bar
              dataKey="agendadas"
              fill="hsl(var(--primary))"
              name="Agendadas"
            />
            <Bar
              dataKey="realizadas"
              fill="hsl(var(--success))"
              name="Realizadas"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
