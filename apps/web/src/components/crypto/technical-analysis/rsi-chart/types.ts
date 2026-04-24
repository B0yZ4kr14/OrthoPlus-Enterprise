import type { ChartDataItem } from "@/types/crypto";

export type { ChartDataItem };

export interface RSIChartProps {
  chartData: ChartDataItem[];
}

export interface RSITooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataItem;
  }>;
}
