import { motion } from "framer-motion";
import { StatsCard } from "@/components/shared/StatsCard";
import {
  DollarSign,
  FileText,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  CheckCircle2,
  Package,
} from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { StaggerGrid, statsStagger } from "./DashboardAnimations";
import type { DashboardStats } from "@orthoplus/shared-types";

interface DashboardTabFinanceiroProps {
  stats: DashboardStats;
}

export default function DashboardTabFinanceiro({ stats }: DashboardTabFinanceiroProps) {
  return (
    <StaggerGrid
      variants={statsStagger}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Receita Mensal"
          value={`R$ ${stats.monthlyRevenue.toLocaleString("pt-BR")}`}
          description="Faturamento do mes"
          icon={DollarSign}
          variant="success"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Contas a Receber"
          value="R$ 45.300"
          description="A vencer este mes"
          icon={FileText}
          variant="warning"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Inadimplencia"
          value="R$ 8.200"
          description="Pagamentos atrasados"
          icon={AlertTriangle}
          variant="danger"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Ticket Medio"
          value="R$ 850"
          description="Por paciente"
          icon={TrendingUp}
          variant="primary"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Vendas PDV"
          value="R$ 12.400"
          description="Vendas do mes"
          icon={ShoppingCart}
          variant="success"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Formas de Pagamento"
          value="6 ativas"
          description="PIX, Cartao, Cripto"
          icon={DollarSign}
          variant="default"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Taxa de Conversao"
          value="68%"
          description="Orcamentos aprovados"
          icon={CheckCircle2}
          variant="success"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatsCard
          title="Valor em Estoque"
          value="R$ 23.500"
          description="Materiais disponiveis"
          icon={Package}
          variant="default"
        />
      </motion.div>
    </StaggerGrid>
  );
}
