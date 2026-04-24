import type { ChartDataItem } from "@/types/crypto";

export type { ChartDataItem };

export interface PriceChartProps {
  chartData: ChartDataItem[];
}

export interface PriceTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number | string;
    payload: ChartDataItem;
  }>;
}
