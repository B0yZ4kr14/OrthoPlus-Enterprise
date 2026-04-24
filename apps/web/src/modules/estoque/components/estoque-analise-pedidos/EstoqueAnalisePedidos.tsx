// cspell:disable
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { Card } from "@orthoplus/core-ui/card";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { useAnalisePedidos } from "./useAnalisePedidos";
import { KpiCards } from "./KpiCards";
import { ChartsSection } from "./ChartsSection";
import { FornecedoresTable } from "./FornecedoresTable";
import { ProdutosTable } from "./ProdutosTable";

export function EstoqueAnalisePedidos() {
  const {
    loading,
    pedidos,
    stats,
    historicoFornecedor,
    produtosMaisPedidos,
    evolucaoPedidos,
    statusDistribution,
  } = useAnalisePedidos();

  if (loading) {
    return (
      <LoadingState
        variant="spinner"
        size="lg"
        message="Carregando análise de pedidos..."
      />
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Análise de Pedidos"
          description="Histórico e estatísticas de compras"
          icon={ShoppingCart}
        />
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Nenhum pedido encontrado. Crie seu primeiro pedido para visualizar
            análises.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Análise de Pedidos"
        description="Histórico e estatísticas de compras"
        icon={ShoppingCart}
      />

      <KpiCards stats={stats} />
      <ChartsSection
        historicoFornecedor={historicoFornecedor}
        produtosMaisPedidos={produtosMaisPedidos}
        evolucaoPedidos={evolucaoPedidos}
        statusDistribution={statusDistribution}
      />
      <FornecedoresTable fornecedores={historicoFornecedor} />
      <ProdutosTable produtos={produtosMaisPedidos} />
    </div>
  );
}

export default EstoqueAnalisePedidos;
