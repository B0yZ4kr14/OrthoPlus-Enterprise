import { useState } from "react";
import { Plus, Package, AlertTriangle, TrendingDown, List, Archive, AlertOctagon } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { useProdutos } from "../../presentation/hooks";
import { ProdutoList } from "../components/ProdutoList";
import { ProdutoForm } from "../components/ProdutoForm";
import { MovimentacaoForm } from "../components/MovimentacaoForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { Card } from "@orthoplus/core-ui/card";
// @ts-expect-error — TS2307
import type { Produto } from "../../domain/entities/Produto";

export const EstoquePage = () => {
  const [showProdutoForm, setShowProdutoForm] = useState(false);
  const [showMovimentacaoForm, setShowMovimentacaoForm] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState<string>();

  const {
    produtos,
    produtosEstoqueBaixo,
    produtosZerados,
    valorTotalEstoque,
    isLoading,
  } = useProdutos();

  const handleOpenMovimentacao = (produtoId: string) => {
    setSelectedProdutoId(produtoId);
    setShowMovimentacaoForm(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="Controle de Estoque"
        description="Gerencie produtos, movimentações e alertas"
        actions={
          <Button onClick={() => setShowProdutoForm(true)} className="gap-2 glow-interactive">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        }
      />

      {/* Métricas Premium */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total de Produtos"
          value={produtos.length}
          icon={Package}
          variant="primary"
          description="itens cadastrados"
        />
        <StatsCard
          title="Valor Total"
          value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorTotalEstoque)}
          icon={TrendingDown}
          variant="success"
          description="em estoque"
        />
        <StatsCard
          title="Estoque Baixo"
          value={produtosEstoqueBaixo.length}
          icon={AlertTriangle}
          variant="warning"
          description="produtos em alerta"
        />
        <StatsCard
          title="Estoque Zerado"
          value={produtosZerados.length}
          icon={AlertOctagon}
          variant="danger"
          description="produtos zerados"
        />
      </div>

      {/* Tabs Premium */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl p-1">
          <TabsTrigger value="todos" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            <List className="h-4 w-4" />
            Todos ({produtos.length})
          </TabsTrigger>
          <TabsTrigger value="alertas" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            <AlertTriangle className="h-4 w-4" />
            Alertas ({produtosEstoqueBaixo.length})
          </TabsTrigger>
          <TabsTrigger value="zerados" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            <Archive className="h-4 w-4" />
            Zerados ({produtosZerados.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          <Card className="glass-card overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--interactive))] to-transparent opacity-30" />
            <div className="p-1">
              <ProdutoList
                produtos={produtos as unknown as Produto[]}
                isLoading={isLoading}
                onMovimentacao={handleOpenMovimentacao}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="mt-6">
          <Card className="glass-card overflow-hidden border-l-warning/40">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--warning))] to-transparent opacity-40" />
            <div className="p-1">
              <ProdutoList
                produtos={produtosEstoqueBaixo as unknown as Produto[]}
                isLoading={isLoading}
                onMovimentacao={handleOpenMovimentacao}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="zerados" className="mt-6">
          <Card className="glass-card overflow-hidden border-l-destructive/40">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--destructive))] to-transparent opacity-40" />
            <div className="p-1">
              <ProdutoList
                produtos={produtosZerados as unknown as Produto[]}
                isLoading={isLoading}
                onMovimentacao={handleOpenMovimentacao}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {showProdutoForm && (
        <ProdutoForm open={showProdutoForm} onClose={() => setShowProdutoForm(false)} />
      )}

      {showMovimentacaoForm && selectedProdutoId && (
        <MovimentacaoForm
          open={showMovimentacaoForm}
          produtoId={selectedProdutoId}
          onClose={() => {
            setShowMovimentacaoForm(false);
            setSelectedProdutoId(undefined);
          }}
        />
      )}
    </div>
  );
};
