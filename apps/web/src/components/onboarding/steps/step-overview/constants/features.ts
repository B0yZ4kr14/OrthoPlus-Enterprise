import { Zap, Shield, Blocks, Sparkles, TrendingUp, Database } from "lucide-react";

export interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
}

export const FEATURES: Feature[] = [
  {
    icon: Blocks,
    title: "22 Módulos Descentralizados",
    description:
      "Sistema 100% modular plug-and-play. Ative apenas o que você precisa.",
    badge: "Modular",
  },
  {
    icon: Sparkles,
    title: "IA Integrada",
    description:
      "Análise de radiografias com Gemini Vision, previsão de estoque com ML.",
    badge: "IA",
  },
  {
    icon: Zap,
    title: "Automação Completa",
    description: "Agendamentos, cobranças, pedidos de estoque automatizados.",
    badge: "Automação",
  },
  {
    icon: Shield,
    title: "LGPD Nativo",
    description:
      "Compliance total desde o design. Auditoria, consentimentos, anonimização.",
    badge: "Compliance",
  },
  {
    icon: TrendingUp,
    title: "Business Intelligence",
    description:
      "Dashboards interativos, relatórios customizáveis, análise preditiva.",
    badge: "Analytics",
  },
  {
    icon: Database,
    title: "Multi-tenancy Robusto",
    description:
      "RLS completo, isolamento total de dados, escalabilidade infinita.",
    badge: "Enterprise",
  },
];
