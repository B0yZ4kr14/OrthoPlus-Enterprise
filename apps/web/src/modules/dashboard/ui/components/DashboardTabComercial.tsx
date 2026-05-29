import { motion } from "framer-motion";
import { StatsCard } from "@/components/shared/StatsCard";
import {
  Users,
  TrendingUp,
  DollarSign,
  Megaphone,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { StaggerGrid, statsStagger } from "./DashboardAnimations";

export default function DashboardTabComercial() {
  return (
    <StaggerGrid
      variants={statsStagger}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Leads Ativos"
          value="124"
          description="Prospects no funil"
          icon={Users}
          variant="primary"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Taxa de Conversao"
          value="68%"
          description="Leads -> Pacientes"
          icon={TrendingUp}
          variant="success"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="CAC (Custo Aquisicao)"
          value="R$ 180"
          description="Por novo paciente"
          icon={DollarSign}
          variant="warning"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="ROI de Marketing"
          value="340%"
          description="Retorno sobre investimento"
          icon={Megaphone}
          variant="success"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Campanhas Ativas"
          value="7"
          description="Em execucao"
          icon={Megaphone}
          variant="default"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Taxa de Abertura"
          value="42%"
          description="E-mails de campanha"
          icon={Activity}
          variant="primary"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Recalls Pendentes"
          value="89"
          description="Pacientes para contato"
          icon={AlertTriangle}
          variant="warning"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="NPS (Satisfacao)"
          value="8.7"
          description="De 10.0"
          icon={CheckCircle2}
          variant="success"
        />
      </motion.div>
    </StaggerGrid>
  );
}
