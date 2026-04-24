export type ExportFormat = "json" | "csv" | "excel" | "pdf";

export interface ExportFormatOption {
  value: ExportFormat;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}
