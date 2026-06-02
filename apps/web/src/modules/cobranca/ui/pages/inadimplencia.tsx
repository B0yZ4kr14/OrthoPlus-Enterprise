import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { Button } from "@orthoplus/core-ui/button";
import {AlertCircle, Settings, TrendingDown} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InadimplenciaList } from "@/modules/inadimplencia/presentation/components/InadimplenciaList";
import { CobrancaAutomation } from "@/modules/inadimplencia/presentation/components/CobrancaAutomation";
import { InadimplenciaDashboard } from "@/modules/inadimplencia/presentation/components/InadimplenciaDashboard";
import { useInadimplentes } from "@/modules/inadimplencia/application/hooks/useInadimplentes";

export default function InadimplenciaPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { inadimplentes, campanhas, isLoading } = useInadimplentes();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={TrendingDown}
        title="Controle de Inadimplência"
        description="Gestão e cobrança automatizada de débitos"
        actions={
          <Button>
            <AlertCircle className="mr-2 h-4 w-4" />
            Nova Cobrança
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">
            <TrendingDown className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="list">
            <AlertCircle className="mr-2 h-4 w-4" />
            Inadimplentes
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Settings className="mr-2 h-4 w-4" />
            Automação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <InadimplenciaDashboard />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <InadimplenciaList />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <CobrancaAutomation />
        </TabsContent>
      </Tabs>
    </div>
  );
}
