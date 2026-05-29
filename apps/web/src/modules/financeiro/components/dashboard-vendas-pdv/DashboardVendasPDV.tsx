// cspell:disable
import { BarChart3, Users, Award, Clock, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { useDashboardVendasPDV } from "./useDashboardVendasPDV";
import { KPICards } from "./KPICards";
import { PeriodFilter } from "./PeriodFilter";
import { VendedoresTab } from "./VendedoresTab";
import { ProdutosTab } from "./ProdutosTab";
import { HorariosTab } from "./HorariosTab";
import { PagamentosTab } from "./PagamentosTab";

export default function DashboardVendasPDV() {
  const {
    periodo,
    setPeriodo,
    isLoading,
    stats,
    vendedoresData,
    produtosData,
    horariosData,
    pagamentosData,
    tempoData,
  } = useDashboardVendasPDV();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard de Vendas PDV"
        description="Analytics completo de performance de vendas e operação do PDV"
        icon={BarChart3}
      />

      <PeriodFilter periodo={periodo} onChange={setPeriodo} />
      <KPICards stats={stats} />

      <Tabs defaultValue="vendedores" className="space-y-6">
        <TabsList>
          <TabsTrigger value="vendedores">
            <Users className="h-4 w-4 mr-2" />
            Vendedores
          </TabsTrigger>
          <TabsTrigger value="produtos">
            <Award className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="horarios">
            <Clock className="h-4 w-4 mr-2" />
            Horários
          </TabsTrigger>
          <TabsTrigger value="pagamentos">
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendedores" className="space-y-6">
          <VendedoresTab data={vendedoresData} />
        </TabsContent>

        <TabsContent value="produtos" className="space-y-6">
          <ProdutosTab data={produtosData} />
        </TabsContent>

        <TabsContent value="horarios" className="space-y-6">
          <HorariosTab data={horariosData} />
        </TabsContent>

        <TabsContent value="pagamentos" className="space-y-6">
          <PagamentosTab
            pagamentosData={pagamentosData}
            tempoData={tempoData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
