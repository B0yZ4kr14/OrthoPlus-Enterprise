export interface Module {
  id: number;
  module_key: string;
  name: string;
  category: string;
  is_active: boolean;
}

export interface SidebarPreviewProps {
  modules: Module[];
}

export const CATEGORY_LABELS: Record<string, string> = {
  "Atendimento Clínico": "Clínico",
  "Gestão Financeira": "Financeiro",
  "Relacionamento & Vendas": "Vendas",
  "Conformidade & Legal": "Legal",
  "Tecnologias Avançadas": "Tech",
};
