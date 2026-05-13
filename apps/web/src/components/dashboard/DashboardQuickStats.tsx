import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import { StatCardMemo } from "./StatCardMemo";
import { EmptyStatCard } from "./EmptyStatCard";

interface QuickStatItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  variant?: "blue" | "purple" | "green" | "orange" | "red";
  onCtaClick?: () => void;
}

interface DashboardQuickStatsProps {
  stats: QuickStatItem[];
}

function isEmptyValue(value: string | number): boolean {
  if (typeof value === "number") return value === 0;
  if (value === "0" || value === "R$ 0" || value === "0%") return true;
  const numeric = parseFloat(
    value
      .replace(/R\$\s?/g, "")
      .replace(/%/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".")
  );
  return !isNaN(numeric) && numeric === 0;
}

const emptyStateMap: Record<
  string,
  { description: string; ctaLabel: string }
> = {
  "Total de Pacientes": {
    description: "Nenhum paciente cadastrado",
    ctaLabel: "Adicionar Paciente",
  },
  "Consultas Hoje": {
    description: "Nenhuma consulta hoje",
    ctaLabel: "Nova Consulta",
  },
  "Receita Mensal": {
    description: "Nenhuma receita registrada",
    ctaLabel: "Registrar Pagamento",
  },
  "Taxa de Ocupacao": {
    description: "Nenhuma ocupação hoje",
    ctaLabel: "Ver Agenda",
  },
  "Taxa de Ocupação": {
    description: "Nenhuma ocupação hoje",
    ctaLabel: "Ver Agenda",
  },
};

export function DashboardQuickStats({ stats }: DashboardQuickStatsProps) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => {
        if (isEmptyValue(stat.value)) {
          const emptyState = emptyStateMap[stat.title];
          return (
            <EmptyStatCard
              key={stat.title}
              title={stat.title}
              description={
                emptyState?.description ?? "Nenhum dado disponível"
              }
              ctaLabel={emptyState?.ctaLabel ?? "Adicionar"}
              onCtaClick={stat.onCtaClick}
              icon={stat.icon}
              index={index}
            />
          );
        }

        return (
          <StatCardMemo
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            subtitle={stat.subtitle}
            variant={stat.variant}
            index={index}
          />
        );
      })}
    </motion.div>
  );
}
