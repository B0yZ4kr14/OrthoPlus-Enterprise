export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  metrics: string[];
  filters: unknown;
  layout: string;
  is_active: boolean;
  created_at: string;
}

export interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  metrics: string[];
  layout: string;
}

export const AVAILABLE_METRICS = [
  { id: "receitas", label: "Total de Receitas", category: "financeiro" },
  { id: "despesas", label: "Total de Despesas", category: "financeiro" },
  { id: "lucro", label: "Lucro Líquido", category: "financeiro" },
  { id: "pacientes_novos", label: "Pacientes Novos", category: "pacientes" },
  { id: "pacientes_ativos", label: "Pacientes Ativos", category: "pacientes" },
  { id: "consultas", label: "Total de Consultas", category: "agenda" },
  { id: "cancelamentos", label: "Taxa de Cancelamento", category: "agenda" },
  { id: "ocupacao", label: "Taxa de Ocupação", category: "agenda" },
  { id: "procedimentos", label: "Procedimentos Realizados", category: "procedimentos" },
  { id: "ticket_medio", label: "Ticket Médio", category: "financeiro" },
];

export const TEMPLATE_CATEGORIES = [
  { value: "financeiro", label: "Financeiro" },
  { value: "pacientes", label: "Pacientes" },
  { value: "agenda", label: "Agenda" },
  { value: "procedimentos", label: "Procedimentos" },
  { value: "marketing", label: "Marketing" },
];

export const LAYOUT_OPTIONS = [
  { value: "table", label: "Tabela" },
  { value: "chart", label: "Gráficos" },
  { value: "dashboard", label: "Dashboard" },
];

export const DEFAULT_FORM_DATA: TemplateFormData = {
  name: "",
  description: "",
  category: "financeiro",
  metrics: [],
  layout: "table",
};
