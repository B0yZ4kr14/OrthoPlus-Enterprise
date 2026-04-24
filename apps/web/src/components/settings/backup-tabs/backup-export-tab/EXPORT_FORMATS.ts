import { FileJson, FileSpreadsheet, FileText } from "lucide-react";
import type { ExportFormatOption } from "./types";

export const EXPORT_FORMATS: ExportFormatOption[] = [
  {
    value: "json",
    label: "JSON",
    icon: FileJson,
    description: "Formato estruturado",
  },
  {
    value: "csv",
    label: "CSV",
    icon: FileSpreadsheet,
    description: "Planilha Excel",
  },
  {
    value: "excel",
    label: "Excel",
    icon: FileSpreadsheet,
    description: "XLSX nativo",
  },
  {
    value: "pdf",
    label: "PDF",
    icon: FileText,
    description: "Documento",
  },
];
