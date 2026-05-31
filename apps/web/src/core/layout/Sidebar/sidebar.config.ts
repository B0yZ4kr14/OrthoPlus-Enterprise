/**
 * SIDEBAR CONFIGURATION V6 - OrthoPlus Enterprise
 * Clean structure, zero duplicate icons
 */

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  ScanLine,
  ClipboardPlus,
  Calculator,
  FileSignature,
  Stethoscope,
  Wallet,
  TrendingUp,
  AlertCircle,
  ShoppingCart,
  ArrowLeftRight,
  Receipt,
  Bitcoin,
  Target,
  Gift,
  Megaphone,
  UserCircle,
  BarChart3,
  Package,
  LayoutGrid,
  History,
  Brain,
  Video,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  UserCog,
  UsersRound,
  KeyRound,
  Puzzle,
  Database,
  HardDrive,
  Terminal,
  Github,
  CircleDollarSign,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  ClipboardSignature,
  FileCheck,
  FileCode,
  ScrollText,
  Scan,
  Activity,
  Bell,
  FolderOpen,
  BrainCircuit,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  moduleKey?: string;
  collapsed?: boolean;
  subItems?: MenuItem[];
  isSubItem?: boolean;
  badge?: {
    count: number | string;
    variant?: "default" | "destructive" | "outline" | "secondary";
  };
}

export interface MenuGroup {
  label: string;
  boundedContext: string;
  category: string;
  collapsed?: boolean;
  items: MenuItem[];
}

export const menuGroups: MenuGroup[] = [
  {
    label: "VISÃO GERAL",
    boundedContext: "DASHBOARD",
    category: "DASHBOARD",
    items: [
      {
        title: "Dashboard Executivo",
        url: "/dashboard",
        icon: LayoutDashboard,
        moduleKey: "DASHBOARD",
      },
    ],
  },
  {
    label: "CLÍNICA",
    boundedContext: "CLINICA",
    category: "CLÍNICA",
    items: [
      {
        title: "Agenda",
        url: "/agenda",
        icon: CalendarDays,
        moduleKey: "AGENDA",
        badge: { count: 0, variant: "default" },
      },
      {
        title: "Pacientes",
        url: "/pacientes",
        icon: Users,
        moduleKey: "PACIENTES",
      },
      {
        title: "Prontuário (PEP)",
        url: "/pep",
        icon: FileText,
        moduleKey: "PEP",
      },
      {
        title: "Odontograma",
        url: "/odontograma",
        icon: ScanLine,
        moduleKey: "ODONTOGRAMA",
      },
      {
        title: "Planos de Tratamento",
        url: "/tratamentos",
        icon: ClipboardPlus,
        moduleKey: "PEP",
      },
      {
        title: "Assinatura ICP",
        url: "/assinatura-icp",
        icon: FileSignature,
        moduleKey: "PEP",
      },
      {
        title: "Fluxo Digital",
        url: "/fluxo-digital",
        icon: Scan,
        moduleKey: "PEP",
      },
      {
        title: "Orçamentos",
        url: "/orcamentos",
        icon: Calculator,
        moduleKey: "ORCAMENTOS",
      },
      {
        title: "Contratos Digitais",
        url: "/contratos",
        icon: FileSignature,
        moduleKey: "CONTRATOS",
      },
      {
        title: "Procedimentos",
        url: "/procedimentos",
        icon: Stethoscope,
        moduleKey: "PROCEDIMENTOS",
      },
    ],
  },
  {
    label: "FINANCEIRO",
    boundedContext: "FINANCEIRO",
    category: "FINANCEIRO",
    items: [
      {
        title: "Fluxo de Caixa",
        url: "/financeiro",
        icon: Wallet,
        moduleKey: "FINANCEIRO",
      },
      {
        title: "Contas a Receber",
        url: "/financeiro/receber",
        icon: TrendingUp,
        moduleKey: "FINANCEIRO",
        badge: { count: 0, variant: "destructive" },
      },
      {
        title: "Inadimplência",
        url: "/inadimplencia",
        icon: AlertCircle,
        moduleKey: "INADIMPLENCIA",
        badge: { count: 0, variant: "destructive" },
      },
      {
        title: "PDV (Ponto de Venda)",
        url: "/pdv",
        icon: ShoppingCart,
        moduleKey: "PDV",
      },
      {
        title: "Split de Pagamentos",
        url: "/split-pagamento",
        icon: ArrowLeftRight,
        moduleKey: "SPLIT_PAGAMENTO",
      },
      {
        title: "Notas Fiscais",
        url: "/financeiro/fiscal/notas",
        icon: Receipt,
        moduleKey: "FINANCEIRO",
      },
      {
        title: "NF-e",
        url: "/faturamento/nfes",
        icon: FileText,
        moduleKey: "FATURAMENTO",
      },
      {
        title: "Relatório Fiscal",
        url: "/faturamento/relatorio",
        icon: FileSpreadsheet,
        moduleKey: "FATURAMENTO",
      },
      {
        title: "Pagamentos Crypto",
        url: "/crypto-payment",
        icon: Bitcoin,
        moduleKey: "CRYPTO_PAYMENTS",
      },
    ],
  },
  {
    label: "CRESCIMENTO",
    boundedContext: "CRESCIMENTO",
    category: "CRESCIMENTO",
    items: [
      {
        title: "CRM",
        url: "/crm",
        icon: Target,
        moduleKey: "CRM",
      },
      {
        title: "Programa de Fidelidade",
        url: "/fidelidade",
        icon: Gift,
        moduleKey: "FIDELIDADE",
      },
      {
        title: "Campanhas de Marketing",
        url: "/marketing-auto",
        icon: Megaphone,
        moduleKey: "MARKETING_AUTO",
      },
      {
        title: "Recall",
        url: "/recall",
        icon: Bell,
        moduleKey: "MARKETING_AUTO",
      },
      {
        title: "Portal do Paciente",
        url: "/portal-paciente",
        icon: UserCircle,
        moduleKey: "PORTAL_PACIENTE",
      },
      {
        title: "Business Intelligence",
        url: "/bi",
        icon: BarChart3,
        moduleKey: "BI",
      },
      {
        title: "Dashboard Comercial",
        url: "/dashboards/comercial",
        icon: TrendingUp,
        moduleKey: "BI",
      },
    ],
  },
  {
    label: "OPERAÇÕES",
    boundedContext: "OPERACOES",
    category: "OPERAÇÕES",
    items: [
      {
        title: "Estoque",
        url: "/estoque",
        icon: Package,
        moduleKey: "ESTOQUE",
        subItems: [
          {
            title: "Dashboard Inventário",
            url: "/inventario/dashboard",
            icon: LayoutGrid,
            moduleKey: "INVENTARIO",
          },
          {
            title: "Histórico Inventários",
            url: "/estoque/inventario-historico",
            icon: History,
            moduleKey: "INVENTARIO",
          },
        ],
      },
      {
        title: "Diagnóstico com IA",
        url: "/ia-radiografia",
        icon: Brain,
        moduleKey: "IA",
      },
      {
        title: "Arquivos",
        url: "/files",
        icon: FolderOpen,
        moduleKey: "FILES",
      },
      {
        title: "Teleodontologia",
        url: "/teleodonto",
        icon: Video,
        moduleKey: "TELEODONTO",
      },
      {
        title: "Memory Hub",
        url: "/memory-hub",
        icon: BrainCircuit,
        moduleKey: "MEMORY_HUB",
      },
      {
        title: "Central de Ajuda",
        url: "/help",
        icon: BookOpen,
        moduleKey: "HELP",
      },
      {
        title: "Faturamento TISS",
        url: "/faturamento-tiss",
        icon: FileSpreadsheet,
        moduleKey: "TISS",
      },
      {
        title: "LGPD & Compliance",
        url: "/lgpd",
        icon: ShieldCheck,
        moduleKey: "LGPD",
      },
    ],
  },
  {
    label: "CONFIGURAÇÕES",
    boundedContext: "CONFIGURACOES",
    category: "CONFIGURAÇÕES",
    items: [
      {
        title: "Configurações Gerais",
        url: "/configuracoes",
        icon: Settings,
        moduleKey: "ADMIN_ONLY",
      },
      {
        title: "Dentistas",
        url: "/dentistas",
        icon: UserCog,
        moduleKey: "ADMIN_ONLY",
      },
      {
        title: "Funcionários",
        url: "/funcionarios",
        icon: UsersRound,
        moduleKey: "ADMIN_ONLY",
      },
      {
        title: "Usuários",
        url: "/usuarios",
        icon: KeyRound,
        moduleKey: "ADMIN_ONLY",
      },
      {
        title: "Meus Módulos",
        url: "/configuracoes/modulos",
        icon: Puzzle,
        moduleKey: "ADMIN_ONLY",
      },
      {
        title: "Bancos por Categoria",
        url: "/configuracoes/database",
        icon: Database,
        moduleKey: "ADMIN_ONLY",
      },
    ],
  },
];

export const adminMenuItems: MenuItem[] = [
  {
    title: "Administração de Banco",
    url: "/admin/database",
    icon: Database,
    moduleKey: "DATABASE_ADMIN",
  },
  {
    title: "Backups Avançados",
    url: "/admin/backups",
    icon: HardDrive,
    moduleKey: "BACKUPS",
  },
  {
    title: "Terminal Web",
    url: "/admin/terminal",
    icon: Terminal,
    moduleKey: "TERMINAL",
  },
  {
    title: "Ferramentas GitHub",
    url: "/admin/github",
    icon: Github,
    moduleKey: "GITHUB_TOOLS",
  },
  {
    title: "Configuração Crypto",
    url: "/admin/crypto-config",
    icon: CircleDollarSign,
    moduleKey: "CRYPTO_CONFIG",
  },
  {
    title: "Wiki & Documentação",
    url: "/admin/wiki",
    icon: BookOpen,
    moduleKey: "ADMIN_ONLY",
  },
  {
    title: "Audit Logs",
    url: "/admin/audit",
    icon: ClipboardList,
    moduleKey: "ADMIN_ONLY",
  },
  {
    title: "Monitoramento",
    url: "/admin/monitoring",
    icon: Activity,
    moduleKey: "ADMIN_ONLY",
  },
  {
    title: "ADRs",
    url: "/admin/adrs",
    icon: FileCheck,
    moduleKey: "ADMIN_ONLY",
  },
  {
    title: "API Docs",
    url: "/admin/api-docs",
    icon: FileCode,
    moduleKey: "ADMIN_ONLY",
  },
  {
    title: "Audit Trail",
    url: "/admin/audit-trail",
    icon: ClipboardSignature,
    moduleKey: "ADMIN_ONLY",
  },
  {
    title: "Logs",
    url: "/admin/logs",
    icon: ScrollText,
    moduleKey: "ADMIN_ONLY",
  },
];
