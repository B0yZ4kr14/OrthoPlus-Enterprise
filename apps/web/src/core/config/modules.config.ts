/**
 * Módulos Configuration - Central Source of Truth
 * Consolidates all module-related logic and constants
 *
 * FASE 1.1: Arquivo consolidado (migrado de src/lib/modules.ts)
 */

export interface ModuleConfig {
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  dependencies?: string[];
}

// ============= TIPOS PARA RUNTIME =============

export interface Module {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  subscribed: boolean;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  unmet_dependencies: string[];
  active_dependents: string[];
}

export const MODULES_CONFIG: Record<string, ModuleConfig> = {
  // ========== ATENDIMENTO CLÍNICO ==========
  DASHBOARD: {
    key: "DASHBOARD",
    name: "Dashboard",
    description: "Visão geral do sistema",
    category: "Atendimento Clínico",
    icon: "LayoutDashboard",
  },
  AGENDA: {
    key: "AGENDA",
    name: "Agenda Inteligente",
    description: "Gestão de consultas e automação via WhatsApp",
    category: "Atendimento Clínico",
    icon: "CalendarDays",
  },
  PACIENTES: {
    key: "PACIENTES",
    name: "Pacientes",
    description: "Cadastro e gestão de pacientes",
    category: "Atendimento Clínico",
    icon: "Users",
  },
  PEP: {
    key: "PEP",
    name: "Prontuário Eletrônico (PEP)",
    description: "Prontuário digital completo",
    category: "Atendimento Clínico",
    icon: "FileHeart",
  },
  ODONTOGRAMA: {
    key: "ODONTOGRAMA",
    name: "Odontograma",
    description: "Mapa dental 2D e 3D",
    category: "Atendimento Clínico",
    icon: "Microscope",
  },
  ESTOQUE: {
    key: "ESTOQUE",
    name: "Controle de Estoque",
    description: "Gestão de materiais e insumos",
    category: "Atendimento Clínico",
    icon: "Package",
  },

  CRYPTO_PAYMENTS: {
    key: "CRYPTO_PAYMENTS",
    name: "Pagamentos em Criptomoedas",
    description:
      "Recebimentos via Bitcoin, USDT, ETH através de BTCPay Server ou exchanges (Binance, Coinbase, Kraken)",
    category: "Gestão Financeira",
    icon: "Bitcoin",
    dependencies: ["FINANCEIRO"],
  },
  PROCEDIMENTOS: {
    key: "PROCEDIMENTOS",
    name: "Procedimentos",
    description: "Catálogo de procedimentos odontológicos",
    category: "Atendimento Clínico",
    icon: "Clipboard",
  },
  TELEODONTO: {
    key: "TELEODONTO",
    name: "Teleodontologia",
    description: "Atendimento remoto",
    category: "Conformidade & Legal",
    icon: "Video",
  },

  // ========== GESTÃO FINANCEIRA ==========
  FINANCEIRO: {
    key: "FINANCEIRO",
    name: "Gestão Financeira",
    description: "Fluxo de caixa e controles financeiros",
    category: "Gestão Financeira",
    icon: "BarChart3",
  },
  SPLIT_PAGAMENTO: {
    key: "SPLIT_PAGAMENTO",
    name: "Split de Pagamento",
    description: "Divisão automática de pagamentos",
    category: "Gestão Financeira",
    icon: "Split",
    dependencies: ["FINANCEIRO"],
  },
  INADIMPLENCIA: {
    key: "INADIMPLENCIA",
    name: "Controle de Inadimplência",
    description: "Cobrança automatizada",
    category: "Gestão Financeira",
    icon: "AlertTriangle",
    dependencies: ["FINANCEIRO"],
  },
  ORCAMENTOS: {
    key: "ORCAMENTOS",
    name: "Orçamentos",
    description: "Criação e gestão de orçamentos",
    category: "Atendimento Clínico",
    icon: "FileText",
    dependencies: ["ODONTOGRAMA"],
  },

  // ========== RELACIONAMENTO & VENDAS ==========
  CRM: {
    key: "CRM",
    name: "CRM",
    description: "Gestão de relacionamento com pacientes",
    category: "Relacionamento & Vendas",
    icon: "Target",
  },
  MARKETING_AUTO: {
    key: "MARKETING_AUTO",
    name: "Automação de Marketing",
    description: "Campanhas automatizadas",
    category: "Relacionamento & Vendas",
    icon: "Send",
  },
  BI: {
    key: "BI",
    name: "Business Intelligence",
    description: "Dashboards e relatórios avançados",
    category: "Relacionamento & Vendas",
    icon: "PieChart",
  },

  // ========== CONFORMIDADE & LEGAL ==========
  LGPD: {
    key: "LGPD",
    name: "Segurança e Conformidade LGPD",
    description: "Gestão de privacidade e dados",
    category: "Conformidade & Legal",
    icon: "ShieldCheck",
  },
  ASSINATURA_ICP: {
    key: "ASSINATURA_ICP",
    name: "Assinatura Digital",
    description: "Assinatura qualificada ICP-Brasil",
    category: "Conformidade & Legal",
    icon: "FileSignature",
    dependencies: ["PEP"],
  },
  TISS: {
    key: "TISS",
    name: "Faturamento TISS",
    description: "Padrão TISS para convênios",
    category: "Conformidade & Legal",
    icon: "FileSpreadsheet",
    dependencies: ["PEP"],
  },

  // ========== TECNOLOGIAS AVANÇADAS ==========
  FLUXO_DIGITAL: {
    key: "FLUXO_DIGITAL",
    name: "Fluxo Digital",
    description: "Integração com scanners e laboratórios",
    category: "Tecnologias Avançadas",
    icon: "Workflow",
    dependencies: ["PEP"],
  },
  IA: {
    key: "IA",
    name: "Inteligência Artificial",
    description: "IA aplicada à odontologia",
    category: "Tecnologias Avançadas",
    icon: "BrainCircuit",
    dependencies: ["PEP", "FLUXO_DIGITAL"],
  },
};

export const MODULE_CATEGORIES = {
  "Atendimento Clínico": "Clínico",
  "Gestão Financeira": "Financeiro",
  "Relacionamento & Vendas": "Vendas",
  "Conformidade & Legal": "Legal",
  "Tecnologias Avançadas": "Tech",
} as const;

export type ModuleCategory = keyof typeof MODULE_CATEGORIES;

export interface ModuleCategoryGroup {
  name: string;
  label: string;
  modules: Module[];
}

export function getModulesByCategory(category: string): ModuleConfig[] {
  return Object.values(MODULES_CONFIG).filter((m) => m.category === category);
}

export function getModuleDependencies(moduleKey: string): string[] {
  return MODULES_CONFIG[moduleKey]?.dependencies || [];
}

export function hasAllDependencies(
  moduleKey: string,
  activeModules: string[],
): boolean {
  const dependencies = getModuleDependencies(moduleKey);
  return dependencies.every((dep) => activeModules.includes(dep));
}

// ============= FUNÇÕES MIGRADAS DE src/lib/modules.ts =============

/**
 * Agrupa módulos por categoria (migrado de lib/modules.ts)
 */
export function groupModulesByCategory(
  modules: Module[],
): ModuleCategoryGroup[] {
  const categoryMap = new Map<string, Module[]>();

  modules.forEach((module) => {
    const category = module.category || "Outros";
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(module);
  });

  return Array.from(categoryMap.entries()).map(([name, modules]) => ({
    name,
    label: MODULE_CATEGORIES[name as keyof typeof MODULE_CATEGORIES] || name,
    modules,
  }));
}

/**
 * Calcula estatísticas dos módulos (migrado de lib/modules.ts)
 */
export function getModuleStats(modules: Module[]) {
  return {
    total: modules.length,
    subscribed: modules.filter((m) => m.subscribed).length,
    active: modules.filter((m) => m.is_active).length,
    available: modules.filter((m) => !m.subscribed).length,
  };
}
