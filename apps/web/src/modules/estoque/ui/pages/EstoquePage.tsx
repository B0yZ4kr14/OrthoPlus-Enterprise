import { useState } from "react";
import { Plus, Package, AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { useProdutos } from "../../presentation/hooks";
import { ProdutoList } from "../components/ProdutoList";
import { ProdutoForm } from "../components/ProdutoForm";
import { MovimentacaoForm } from "../components/MovimentacaoForm";
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controle de Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie produtos, movimentações e alertas
          </p>
        </div>
        <Button onClick={() => setShowProdutoForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
            <p className="text-xs text-muted-foreground">itens cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(valorTotalEstoque)}
            </div>
            <p className="text-xs text-muted-foreground">em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {produtosEstoqueBaixo.length}
            </div>
            <p className="text-xs text-muted-foreground">produtos em alerta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estoque Zerado
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {produtosZerados.length}
            </div>
            <p className="text-xs text-muted-foreground">produtos zerados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos os Produtos</TabsTrigger>
          <TabsTrigger value="alertas">
            Alertas ({produtosEstoqueBaixo.length})
          </TabsTrigger>
          <TabsTrigger value="zerados">
            Zerados ({produtosZerados.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <ProdutoList
            produtos={produtos as unknown as Produto[]}
            isLoading={isLoading}
            onMovimentacao={handleOpenMovimentacao}
          />
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          <ProdutoList
            produtos={produtosEstoqueBaixo as unknown as Produto[]}
            isLoading={isLoading}
            onMovimentacao={handleOpenMovimentacao}
          />
        </TabsContent>

        <TabsContent value="zerados" className="space-y-4">
          <ProdutoList
            produtos={produtosZerados as unknown as Produto[]}
            isLoading={isLoading}
            onMovimentacao={handleOpenMovimentacao}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showProdutoForm && (
        <ProdutoForm
          open={showProdutoForm}
          onClose={() => setShowProdutoForm(false)}
        />
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
