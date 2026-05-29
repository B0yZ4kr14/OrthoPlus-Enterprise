import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Activity, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@orthoplus/core-ui/button";
import {
  BehaviorKPIs,
  UsagePatternsTab,
  ModulesAccessTab,
  EngagementTab,
  OptimizationsTab,
} from "../components/behavior/BehaviorTabs";

export default function UserBehaviorAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Activity}
          title="Análise Comportamental"
          description="Padrões de uso, horários de pico e otimização de workflow"
        />
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Últimos 7 dias</SelectItem>
              <SelectItem value="last-30-days">Últimos 30 dias</SelectItem>
              <SelectItem value="last-90-days">Últimos 90 dias</SelectItem>
              <SelectItem value="custom">Período customizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Análise
          </Button>
        </div>
      </div>

      <BehaviorKPIs />

      <Tabs defaultValue="patterns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns">Padrões de Uso</TabsTrigger>
          <TabsTrigger value="modules">Módulos Acessados</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="optimizations">Otimizações</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns">
          <UsagePatternsTab />
        </TabsContent>
        <TabsContent value="modules">
          <ModulesAccessTab />
        </TabsContent>
        <TabsContent value="engagement">
          <EngagementTab />
        </TabsContent>
        <TabsContent value="optimizations">
          <OptimizationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
