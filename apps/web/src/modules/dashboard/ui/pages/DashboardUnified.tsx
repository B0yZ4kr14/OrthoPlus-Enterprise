/**
 * DASHBOARD UNIFICADO V5.0 - OrthoPlus Enterprise
 * Consolida 4 dashboards em 1 com abas
 * 18 KPIs criticos organizados por dominio
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Stethoscope,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { staggerContainer } from "@/lib/animations";
import { AnimatedSection } from "../components/DashboardAnimations";
import DashboardTabExecutivo from "../components/DashboardTabExecutivo";
import DashboardTabClinico from "../components/DashboardTabClinico";
import DashboardTabFinanceiro from "../components/DashboardTabFinanceiro";
import DashboardTabComercial from "../components/DashboardTabComercial";

const tabItems = [
  { value: "executivo", label: "Executivo", icon: BarChart3 },
  { value: "clinico", label: "Clinico", icon: Stethoscope },
  { value: "financeiro", label: "Financeiro", icon: DollarSign },
  { value: "comercial", label: "Comercial", icon: Users },
];

export default function DashboardUnified() {
  const { data, isLoading } = useDashboard();
  const [activeTab, setActiveTab] = useState("executivo");
  const reduced = useReducedMotion();

  if (isLoading || !data || !data.stats) {
    return <DashboardSkeleton />;
  }

  const { stats, appointmentsData, revenueData, treatmentsByStatus } = data;

  return (
    <motion.div
      initial={reduced ? false : "hidden"}
      animate="visible"
      variants={reduced ? undefined : staggerContainer}
      className="space-y-8 min-h-screen"
    >
      <AnimatedSection delay={0}>
        <WelcomeBanner userName="Dr. Silva" />
      </AnimatedSection>

      <AnimatedSection delay={0}>
        <div className="glass-card rounded-xl p-6 mb-2">
          <PageHeader
            title="Master Dashboard"
            icon={LayoutDashboard}
            description="Visao analitica em tempo real de toda a rede OrthoPlus"
          />
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            aria-label="Categorias do dashboard"
            className="bg-muted/50 rounded-full p-1 inline-flex h-auto backdrop-blur-sm border border-border/20"
          >
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative min-h-[44px] px-4 py-1.5 rounded-full border-0 bg-transparent shadow-none text-muted-foreground hover:text-foreground transition-colors duration-200 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[hsl(var(--interactive))] data-[state=active]:font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-card shadow-sm rounded-full -z-10"
                    transition={{
                      type: "spring",
                      bounce: 0.15,
                      duration: 0.5,
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2 text-sm">
                  <tab.icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="executivo" className="space-y-6 mt-6">
            <DashboardTabExecutivo
              stats={stats}
              appointmentsData={appointmentsData}
              revenueData={revenueData}
              treatmentsByStatus={treatmentsByStatus}
            />
          </TabsContent>

          <TabsContent value="clinico" className="space-y-6 mt-6">
            <DashboardTabClinico stats={stats} />
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-6 mt-6">
            <DashboardTabFinanceiro stats={stats} />
          </TabsContent>

          <TabsContent value="comercial" className="space-y-6 mt-6">
            <DashboardTabComercial />
          </TabsContent>
        </Tabs>
      </AnimatedSection>
    </motion.div>
  );
}
