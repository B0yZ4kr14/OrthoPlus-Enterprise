export type ChartType = "bar" | "line";

export interface ChartCardMemoProps {
  title: string;
  description?: string;
  data: unknown[];
  type: ChartType;
  dataKey: string;
  xAxisKey: string;
  secondaryDataKey?: string;
}
