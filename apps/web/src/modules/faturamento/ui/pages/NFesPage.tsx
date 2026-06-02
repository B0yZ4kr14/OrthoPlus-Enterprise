import { useState } from "react";
import { useNFes } from "@/modules/faturamento/application/hooks/useNFes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  FileText,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@orthoplus/core-ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { icon: React.ReactNode; className: string; label: string }
  > = {
    PENDENTE: {
      icon: <Clock className="h-3 w-3" />,
      className: "bg-warning/10 text-warning",
      label: "Pendente",
    },
    AUTORIZADA: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: "bg-success/10 text-success",
      label: "Autorizada",
    },
    CANCELADA: {
      icon: <XCircle className="h-3 w-3" />,
      className: "bg-destructive/10 text-destructive",
      label: "Cancelada",
    },
    REJEITADA: {
      icon: <AlertCircle className="h-3 w-3" />,
      className: "bg-warning/10 text-warning",
      label: "Rejeitada",
    },
  };

  const cfg = config[status] || config.PENDENTE;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function NFesPage() {
  const { nfes, isLoading, cancelNFe, isCanceling } = useNFes();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedNFe, setSelectedNFe] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  const filteredNfes = nfes.filter((nfe) => {
    const matchesSearch =
      searchTerm === "" ||
      nfe.numero.toString().includes(searchTerm) ||
      nfe.chave_acesso.includes(searchTerm);
    const matchesStatus =
      statusFilter === "TODOS" || nfe.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancel = () => {
    if (!selectedNFe || !motivoCancelamento.trim()) return;
    cancelNFe(
      { id: selectedNFe, motivo: motivoCancelamento },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          setSelectedNFe(null);
          setMotivoCancelamento("");
        },
      },
    );
  };

  const openCancelDialog = (id: string) => {
    setSelectedNFe(id);
    setMotivoCancelamento("");
    setCancelDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingState message="Carregando notas fiscais..." />;
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Notas Fiscais Eletrônicas"
        description="Gerencie as NF-e, NFC-e e NFS-e emitidas"
        icon={FileText}
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova NFe
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search" className="mb-2 block">
                Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Número ou chave de acesso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="status" className="mb-2 block">
                Status
              </Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="TODOS">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="AUTORIZADA">Autorizada</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="REJEITADA">Rejeitada</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filteredNfes.length === 0 ? (
            <EmptyState
              icon={FileText}
              message="Nenhuma nota fiscal encontrada"
              description={
                searchTerm || statusFilter !== "TODOS"
                  ? "Tente ajustar os filtros de busca."
                  : "Cadastre sua primeira nota fiscal."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Série</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Chave de Acesso</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNfes.map((nfe) => (
                  <TableRow key={nfe.id}>
                    <TableCell className="font-medium">{nfe.numero}</TableCell>
                    <TableCell>{nfe.serie}</TableCell>
                    <TableCell>{nfe.tipo_nota}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {nfe.chave_acesso.slice(0, 20)}...
                    </TableCell>
                    <TableCell>
                      R${" "}
                      {(nfe.valor_total / 100).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={nfe.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(nfe.data_emissao).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      {nfe.status === "PENDENTE" && (
                        <Button type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openCancelDialog(nfe.id)}
                          disabled={isCanceling}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Nota Fiscal</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="motivo">Motivo do Cancelamento</Label>
              <Input
                id="motivo"
                placeholder="Ex: Erro de digitação, duplicidade..."
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button"
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Voltar
            </Button>
            <Button type="button"
              variant="destructive"
              onClick={handleCancel}
              disabled={!motivoCancelamento.trim() || isCanceling}
            >
              {isCanceling ? "Cancelando..." : "Confirmar Cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
