import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePDV, PDVVendaItem, PDVPagamento } from "@/hooks/usePDV";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Separator } from "@orthoplus/core-ui/separator";
import { EmptyState } from "@/components/shared/EmptyState";
import { AberturaCaixaDialog } from "@/components/pdv/AberturaCaixaDialog";
import { FechamentoCaixaDialog } from "@/components/pdv/FechamentoCaixaDialog";
import {
  CreditCard,
  DollarSign,
  ShoppingCart,
  Lock,
  Plus,
  Trash2,
  Receipt,
  Wallet,
  Unlock,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type FormaPagamentoType = PDVPagamento["forma_pagamento"];

interface FormasPagamentoOption {
  value: FormaPagamentoType;
  label: string;
  icon: any;
}

const formasPagamento: FormasPagamentoOption[] = [
  { value: "DINHEIRO", label: "Dinheiro", icon: DollarSign },
  { value: "CREDITO" as any, label: "Cartão Crédito", icon: CreditCard },
  { value: "DEBITO" as any, label: "Cartão Débito", icon: CreditCard },
  { value: "PIX", label: "PIX", icon: Wallet },
  { value: "TRANSFERENCIA", label: "Transferência", icon: Wallet },
  { value: "CRYPTO", label: "Criptomoeda", icon: Wallet },
];

export default function PDVPage() {
  const { clinicId } = useAuth();
  const { caixaAberto, loading, abrirCaixa, fecharCaixa, criarVenda } =
    usePDV(clinicId || undefined);

  const [showAbertura, setShowAbertura] = useState(false);
  const [showFechamento, setShowFechamento] = useState(false);

  const [itens, setItens] = useState<Partial<PDVVendaItem>[]>([]);
  const [descricaoItem, setDescricaoItem] = useState("");
  const [valorItem, setValorItem] = useState("");
  const [quantidadeItem, setQuantidadeItem] = useState("1");

  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoType>("DINHEIRO");
  const [parcelas, setParcelas] = useState("1");

  const totalVenda = useMemo(
    () => itens.reduce((sum, item) => sum + (item.valor_total || 0), 0),
    [itens],
  );

  const valorEsperado = caixaAberto ? caixaAberto.valor_inicial + 0 : 0;

  const adicionarItem = () => {
    if (!descricaoItem || !valorItem) return;
    const quantidade = parseFloat(quantidadeItem) || 1;
    const valor = parseFloat(valorItem) || 0;
    setItens([
      ...itens,
      {
        tipo_item: "SERVICO",
        descricao: descricaoItem,
        quantidade,
        valor_unitario: valor,
        desconto: 0,
        valor_total: quantidade * valor,
      },
    ]);
    setDescricaoItem("");
    setValorItem("");
    setQuantidadeItem("1");
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const finalizarVenda = async () => {
    if (itens.length === 0 || !caixaAberto) return;
    const formaNormalizada: FormaPagamentoType = formaPagamento;
    const taxaOperacao = formaNormalizada === ("CREDITO" as any) ? totalVenda * 0.035 : 0;
    const valorLiquido = totalVenda - taxaOperacao;
    await criarVenda(
      { valor_total: totalVenda, desconto: 0, status: "FINALIZADA" },
      itens,
      [
        {
          forma_pagamento: formaNormalizada,
          valor: totalVenda,
          parcelas: parseInt(parcelas) || 1,
          taxa_operacao: taxaOperacao,
          valor_liquido: valorLiquido,
        } as any,
      ],
    );
    setItens([]);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={ShoppingCart} title="Ponto de Venda (PDV)" description="Gerencie as vendas do seu Ponto de Venda" />
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShoppingCart}
        title="Ponto de Venda (PDV)"
        description="Gerencie as vendas do seu Ponto de Venda"
      />

      {!caixaAberto ? (
        <Card className="glass-card overflow-hidden border-l-destructive/40">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--destructive))] to-transparent opacity-40" />
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <Lock className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Caixa Fechado</p>
                  <p className="text-sm text-muted-foreground">Abra o caixa para iniciar as vendas.</p>
                </div>
              </div>
              <Button onClick={() => setShowAbertura(true)} className="gap-2 glow-interactive">
                <Unlock className="h-4 w-4" />
                Abrir Caixa
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card overflow-hidden border-l-success/40">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--success))] to-transparent opacity-40" />
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Unlock className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Caixa Aberto</p>
                  <p className="text-2xl font-bold text-foreground">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(caixaAberto.valor_inicial)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aberto em {format(new Date(caixaAberto.created_at), "dd/MM/yyyy às HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <Button variant="destructive" onClick={() => setShowFechamento(true)} className="gap-2">
                <Lock className="h-4 w-4" />
                Fechar Caixa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--interactive))] to-transparent opacity-30" />
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">Adicionar Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <Label htmlFor="item-desc">Descrição</Label>
                  <Input
                    id="item-desc"
                    placeholder="Ex: Consulta"
                    value={descricaoItem}
                    onChange={(e) => setDescricaoItem(e.target.value)}
                    disabled={!caixaAberto}
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="item-valor">Valor</Label>
                  <Input
                    id="item-valor"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={valorItem}
                    onChange={(e) => setValorItem(e.target.value)}
                    disabled={!caixaAberto}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="item-qtd">Qtd</Label>
                  <Input
                    id="item-qtd"
                    type="number"
                    value={quantidadeItem}
                    onChange={(e) => setQuantidadeItem(e.target.value)}
                    disabled={!caixaAberto}
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <Button onClick={adicionarItem} disabled={!caixaAberto} className="w-full gap-1 glow-interactive" title="Adicionar item">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {itens.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Itens da Venda</Label>
                  {itens.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 glass-card rounded-xl border border-border/30 hover:border-interactive/30 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.descricao}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantidade}x {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.valor_unitario || 0)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.valor_total || 0)}</p>
                        <Button size="icon" variant="ghost" onClick={() => removerItem(idx)} title="Remover item">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--interactive))] to-transparent opacity-30" />
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight">Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <div className="grid grid-cols-2 gap-2">
                  {formasPagamento.map((forma) => (
                    <Button
                      key={forma.value}
                      variant={formaPagamento === forma.value ? "default" : "outline"}
                      onClick={() => setFormaPagamento(forma.value)}
                      disabled={!caixaAberto}
                      className="justify-start gap-2"
                    >
                      <forma.icon className="h-4 w-4" />
                      {forma.label}
                    </Button>
                  ))}
                </div>
              </div>

              {formaPagamento === ("CREDITO" as any) && (
                <div className="space-y-2">
                  <Label htmlFor="parcelas">Parcelas</Label>
                  <Input
                    id="parcelas"
                    type="number"
                    min="1"
                    max="12"
                    value={parcelas}
                    onChange={(e) => setParcelas(e.target.value)}
                    disabled={!caixaAberto}
                  />
                </div>
              )}

              <Separator className="bg-border/50" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalVenda)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalVenda)}</span>
                </div>
              </div>

              <Button
                onClick={finalizarVenda}
                disabled={!caixaAberto || itens.length === 0}
                className="w-full gap-2 glow-interactive"
                size="lg"
              >
                <Receipt className="h-5 w-5" />
                Finalizar Venda
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AberturaCaixaDialog
        open={showAbertura}
        onOpenChange={setShowAbertura}
        onConfirm={async (v, o) => { await abrirCaixa(v, o); }}
      />

      {caixaAberto && (
        <FechamentoCaixaDialog
          open={showFechamento}
          onOpenChange={setShowFechamento}
          onConfirm={fecharCaixa}
          caixaAberto={caixaAberto}
          valorEsperado={valorEsperado}
        />
      )}
    </div>
  );
}
