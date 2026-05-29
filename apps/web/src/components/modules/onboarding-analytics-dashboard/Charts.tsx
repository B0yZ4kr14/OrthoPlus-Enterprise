// cspell:disable
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AnalyticsData } from "./types";

interface ChartsProps {
  analytics: AnalyticsData;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

export function Charts({ analytics }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Conclusão por Passo</CardTitle>
          <CardDescription>
            Quantos usuários concluíram cada etapa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.stepStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="step_name"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
              <Bar dataKey="completions" fill="#2dd4bf" name="Conclusões" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Tempo Médio por Passo</CardTitle>
          <CardDescription>
            Tempo gasto em cada etapa do onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.stepStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="step_name"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip formatter={(value: number) => formatTime(value)} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
              <Line
                type="monotone"
                dataKey="average_time"
                stroke="#14b8a6"
                strokeWidth={2}
                name="Tempo Médio"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {analytics.dropOffByStep.length > 0 && (
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Análise de Abandono por Passo
            </CardTitle>
            <CardDescription>
              Identifique onde os usuários mais desistem do onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dropOffByStep}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step_name" />
                <YAxis />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
                <Bar dataKey="abandoned" fill="#ef4444" name="Abandonos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
