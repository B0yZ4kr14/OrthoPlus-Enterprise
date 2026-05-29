import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Split, Settings, History, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SplitConfigForm } from "@/modules/split-pagamento/presentation/components/SplitConfigForm";
import { SplitHistory } from "@/modules/split-pagamento/presentation/components/SplitHistory";
import { SplitDashboard } from "@/modules/split-pagamento/presentation/components/SplitDashboard";
import { useSplitConfig } from "@/modules/split-pagamento/application/hooks/useSplitConfig";

export default function SplitPagamentoPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { config, transactions, isLoading } = useSplitConfig();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Split}
        title="Split de Pagamento"
        description="Divisão automática de receitas e otimização tributária"
        actions={
          <Button>
            <Split className="mr-2 h-4 w-4" />
            Nova Regra
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">
            <TrendingUp className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <SplitDashboard />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <SplitConfigForm />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <SplitHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
