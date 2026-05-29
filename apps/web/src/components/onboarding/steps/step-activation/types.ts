export interface Module {
  id: string;
  name: string;
  category: string;
  essential: boolean;
}

export const SAMPLE_MODULES: Module[] = [
  { id: "DASHBOARD", name: "Dashboard", category: "Core", essential: true },
  {
    id: "PACIENTES",
    name: "Pacientes",
    category: "Cadastros",
    essential: true,
  },
  {
    id: "PEP",
    name: "Prontuário Eletrônico",
    category: "Clínica",
    essential: true,
  },
  {
    id: "AGENDA",
    name: "Agenda Inteligente",
    category: "Clínica",
    essential: false,
  },
  {
    id: "FINANCEIRO",
    name: "Gestão Financeira",
    category: "Financeiro",
    essential: false,
  },
  {
    id: "SPLIT_PAGAMENTO",
    name: "Split de Pagamento",
    category: "Financeiro",
    essential: false,
  },
  {
    id: "ESTOQUE",
    name: "Controle de Estoque",
    category: "Operacional",
    essential: false,
  },
  {
    id: "BI",
    name: "Business Intelligence",
    category: "Analytics",
    essential: false,
  },
];
