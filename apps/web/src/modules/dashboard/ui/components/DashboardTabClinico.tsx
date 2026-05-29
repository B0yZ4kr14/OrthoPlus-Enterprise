import { motion } from "framer-motion";
import { StatsCard } from "@/components/shared/StatsCard";
import {
  Calendar,
  FileText,
  CheckCircle2,
  Activity,
  Users,
} from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { StaggerGrid, statsStagger } from "./DashboardAnimations";
import type { DashboardStats } from "@orthoplus/shared-types";

interface DashboardTabClinicoProps {
  stats: DashboardStats;
}

export default function DashboardTabClinico({
  stats,
}: DashboardTabClinicoProps) {
  return (
    <StaggerGrid
      variants={statsStagger}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Consultas de Hoje"
          value={stats.todayAppointments.toString()}
          description="Agendamentos confirmados"
          icon={Calendar}
          variant="default"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Tratamentos Ativos"
          value={stats.pendingTreatments.toString()}
          description="Em andamento"
          icon={FileText}
          variant="warning"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Tratamentos Concluidos"
          value={stats.completedTreatments.toString()}
          description="Finalizados este mes"
          icon={CheckCircle2}
          variant="success"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Taxa de Comparecimento"
          value={`${Math.round(stats.occupancyRate)}%`}
          description="Pacientes compareceram"
          icon={Activity}
          variant="primary"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Novos Pacientes"
          value="47"
          description="Este mes"
          icon={Users}
          variant="success"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Procedimentos/Dia"
          value="12"
          description="Media diaria"
          icon={Activity}
          variant="default"
        />
      </motion.div>
    </StaggerGrid>
  );
}
