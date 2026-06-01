// cspell:disable
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@orthoplus/core-ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { Webhook, Send, RefreshCw } from "lucide-react";
import { useEstoqueIntegracoes } from "./useEstoqueIntegracoes";
import { MetricsCards } from "./MetricsCards";
import { StatusCharts } from "./StatusCharts";
import { FornecedoresList } from "./FornecedoresList";
import { PedidosRecentes } from "./PedidosRecentes";

export function EstoqueIntegracoes() {
  const {
    loading,
    fornecedores,
    pedidos,
    metrics,
    testingAPI,
    statusData,
    historicoData,
    loadData,
    handleTestarAPI,
    handleDisparaPedidosAutomaticos,
  } = useEstoqueIntegracoes();

  if (loading && fornecedores.length === 0) {
    return (
      <LoadingState
        variant="spinner"
        size="lg"
        message="Carregando integrações..."
      />
    );
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={Webhook}
        title="Monitoramento de Integrações"
        description="Acompanhe o status das integrações com APIs de fornecedores e pedidos automáticos"
      />

      <div className="flex gap-3">
        <Button type="button" onClick={handleDisparaPedidosAutomaticos} disabled={loading}>
          <Send className="mr-2 h-4 w-4" />
          Disparar Pedidos Automáticos
        </Button>
        <Button type="button" variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      <MetricsCards metrics={metrics} />
      <StatusCharts statusData={statusData} historicoData={historicoData} />
      <FornecedoresList
        fornecedores={fornecedores}
        pedidos={pedidos}
        testingAPI={testingAPI}
        onTestarAPI={handleTestarAPI}
      />
      <PedidosRecentes pedidos={pedidos} />
    </div>
  );
}

export default EstoqueIntegracoes;
