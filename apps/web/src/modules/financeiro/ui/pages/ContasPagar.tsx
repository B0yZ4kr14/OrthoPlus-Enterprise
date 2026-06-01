import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@orthoplus/core-ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";

import { useFinanceiro } from "@/modules/financeiro/application/hooks/useFinanceiro";
import type { ContaPagar } from "@/modules/financeiro/types/financeiro-completo.types";
import {
  FinanceiroKPICard,
  formatBRL,
} from "@/modules/financeiro/components/FinanceiroKPICard";

export default function ContasPagar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { contasPagar, loading } = useFinanceiro();

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { label: string; variant: "success" | "warning" | "error" | "secondary" }
    > = {
      pago: { label: "Pago", variant: "success" },
      pendente: { label: "Pendente", variant: "warning" },
      atrasado: { label: "Atrasado", variant: "error" },
      agendado: { label: "Agendado", variant: "secondary" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryBadge = (categoria: string) => {
    const colors: Record<string, string> = {
      "Materiais Odontológicos": "bg-info/10 text-info border-info/20",
      "Contas Fixas": "bg-secondary/10 text-secondary border-secondary/20",
      Laboratório: "bg-interactive/10 text-interactive border-interactive/20",
      "Taxas e Impostos": "bg-warning/10 text-warning border-warning/20",
    };
    return (
      <Badge variant="outline" className={colors[categoria] || ""}>
        {categoria}
      </Badge>
    );
  };

  const totalPagar = contasPagar
    .filter((c) => c.status !== "pago")
    .reduce((sum, c) => sum + c.valor, 0);

  const totalAtrasado = contasPagar
    .filter((c) => c.status === "atrasado")
    .reduce((sum, c) => sum + c.valor, 0);

  const totalPago = contasPagar
    .filter((c) => c.status === "pago")
    .reduce((sum, c) => sum + c.valor, 0);

  return (
    <div className="flex-1 space-y-8 p-8">
      <PageHeader
        icon={CreditCard}
        title="Contas a Pagar"
        description="Gerencie fornecedores, despesas e pagamentos"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceiroKPICard
          icon={Clock}
          label="Total a Pagar"
          value={formatBRL(totalPagar)}
          valueClassName="text-warning"
          footer={`${contasPagar.filter((c) => c.status !== "pago").length} contas pendentes`}
        />
        <FinanceiroKPICard
          icon={AlertCircle}
          label="Atrasadas"
          value={formatBRL(totalAtrasado)}
          valueClassName="text-destructive"
          footer={`${contasPagar.filter((c) => c.status === "atrasado").length} contas vencidas`}
        />
        <FinanceiroKPICard
          icon={CheckCircle2}
          label="Pago (Mês)"
          value={formatBRL(totalPago)}
          valueClassName="text-success"
          footer={`${contasPagar.filter((c) => c.status === "pago").length} contas quitadas`}
        />
      </div>

      {/* Filters and Actions */}
      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contas-pagar-search"
                  placeholder="Buscar por fornecedor ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="atrasado">Atrasadas</SelectItem>
                  <SelectItem value="pago">Pagas</SelectItem>
                  <SelectItem value="agendado">Agendadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="elevated" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Conta a Pagar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nova Conta a Pagar</DialogTitle>
                    <DialogDescription>
                      Registre uma nova despesa ou pagamento
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="fornecedor">Fornecedor</Label>
                      <Input id="fornecedor" placeholder="Nome do fornecedor" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="materiais">
                            Materiais Odontológicos
                          </SelectItem>
                          <SelectItem value="contas">Contas Fixas</SelectItem>
                          <SelectItem value="laboratorio">
                            Laboratório
                          </SelectItem>
                          <SelectItem value="impostos">
                            Taxas e Impostos
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor</Label>
                      <Input id="valor" type="number" placeholder="0,00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vencimento">Data de Vencimento</Label>
                      <Input id="vencimento" type="date" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input
                        id="descricao"
                        placeholder="Descrição da despesa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="documento">Número do Documento</Label>
                      <Input id="documento" placeholder="NF, OS, Boleto..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="transferencia">
                            Transferência
                          </SelectItem>
                          <SelectItem value="debito">
                            Débito Automático
                          </SelectItem>
                          <SelectItem value="boleto">Boleto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="elevated"
                      onClick={() => setDialogOpen(false)}
                    >
                      Salvar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com Lista */}
      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas ({contasPagar.length})</TabsTrigger>
          <TabsTrigger value="pendentes">
            Pendentes (
            {contasPagar.filter((c) => c.status === "pendente").length})
          </TabsTrigger>
          <TabsTrigger value="atrasadas">
            Atrasadas (
            {contasPagar.filter((c) => c.status === "atrasado").length})
          </TabsTrigger>
          <TabsTrigger value="pagas">
            Pagas ({contasPagar.filter((c) => c.status === "pago").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          <Card variant="elevated">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasPagar.map((conta) => (
                  <TableRow key={conta.id || Math.random().toString()}>
                    <TableCell className="font-medium">
                      {conta.fornecedor_nome}
                    </TableCell>
                    <TableCell>{getCategoryBadge(conta.categoria)}</TableCell>
                    <TableCell>
                      {conta.descricao}
                      {conta.documento && (
                        <div className="text-xs text-muted-foreground">
                          Doc: {conta.documento}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(conta.valor)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {conta.data_vencimento
                          ? format(
                              new Date(conta.data_vencimento),
                              "dd/MM/yyyy",
                              { locale: ptBR },
                            )
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(conta.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
