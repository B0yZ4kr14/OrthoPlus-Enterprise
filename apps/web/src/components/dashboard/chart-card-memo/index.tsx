import { memo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@orthoplus/core-ui/card";
import type { ChartCardMemoProps } from "./types";
import { BarChartView } from "./components/BarChartView";
import { LineChartView } from "./components/LineChartView";

export * from "./types";
export { BarChartView, LineChartView };

// ✅ FASE 3: Componente de gráficos otimizado com React.memo
export const ChartCardMemo = memo(function ChartCardMemo({
  title,
  description,
  data,
  type,
  dataKey,
  xAxisKey,
  secondaryDataKey,
}: ChartCardMemoProps) {
  const ChartComponent = type === "bar" ? BarChartView : LineChartView;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartComponent
          data={data}
          dataKey={dataKey}
          xAxisKey={xAxisKey}
          secondaryDataKey={secondaryDataKey}
        />
      </CardContent>
    </Card>
  );
});
