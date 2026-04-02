import { useState } from "react";
import { MovimentoCaixa } from "@/domain/entities/MovimentoCaixa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import { DoorOpen, DoorClosed, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";

interface CaixaPanelProps {
  caixaAtual: MovimentoCaixa | null;
  caixaAberto: boolean;
  loading: boolean;
  onAbrirCaixa: (valorInicial: number, userId: string) => Promise<void>;
  onFecharCaixa: (
    valorFinal: number,
    valorEsperado: number,
    observacoes?: string,
  ) => Promise<void>;
  onRegistrarSangria: (
    valor: number,
    motivo: string,
    userId: string,
    horarioRisco?: string,
  ) => Promise<void>;
  userId: string;
}

export function CaixaPanel({
  caixaAtual,
  caixaAberto,
  loading,
  onAbrirCaixa,
  onFecharCaixa,
  onRegistrarSangria,
  userId,
}: CaixaPanelProps) {
  const [valorInicial, setValorInicial] = useState("");
  const [valorFinal, setValorFinal] = useState("");
  const [valorEsperado, setValorEsperado] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [valorSangria, setValorSangria] = useState("");
  const [motivoSangria, setMotivoSangria] = useState("");
  const [isAbrirDialogOpen, setIsAbrirDialogOpen] = useState(false);
  const [isFecharDialogOpen, setIsFecharDialogOpen] = useState(false);
  const [isSangriaDialogOpen, setIsSangriaDialogOpen] = useState(false);

  const handleAbrirCaixa = async () => {
    const valor = parseFloat(valorInicial);
    if (isNaN(valor) || valor < 0) return;
    await onAbrirCaixa(valor, userId);
    setValorInicial("");
    setIsAbrirDialogOpen(false);
  };

  const handleFecharCaixa = async () => {
    const final = parseFloat(valorFinal);
    const esperado = parseFloat(valorEsperado);
    if (isNaN(final) || isNaN(esperado)) return;
    await onFecharCaixa(final, esperado, observacoes || undefined);
    setValorFinal("");
    setValorEsperado("");
    setObservacoes("");
    setIsFecharDialogOpen(false);
  };

  const handleRegistrarSangria = async () => {
    const valor = parseFloat(valorSangria);
    if (isNaN(valor) || valor <= 0 || !motivoSangria.trim()) return;
    await onRegistrarSangria(valor, motivoSangria, userId);
    setValorSangria("");
    setMotivoSangria("");
    setIsSangriaDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="text-center py-8">Carregando informações do caixa...</div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status do Caixa</CardTitle>
              <CardDescription>
                {caixaAberto
                  ? "Caixa aberto para movimentações"
                  : "Caixa fechado"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!caixaAberto ? (
                <Dialog
                  open={isAbrirDialogOpen}
                  onOpenChange={setIsAbrirDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <DoorOpen className="mr-2 h-4 w-4" />
                      Abrir Caixa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Abrir Caixa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="valorInicial">Valor Inicial</Label>
                        <Input
                          id="valorInicial"
                          type="number"
                          step="0.01"
                          value={valorInicial}
                          onChange={(e) => setValorInicial(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <Button onClick={handleAbrirCaixa} className="w-full">
                        Confirmar Abertura
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <>
                  <Dialog
                    open={isSangriaDialogOpen}
                    onOpenChange={setIsSangriaDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <TrendingDown className="mr-2 h-4 w-4" />
                        Sangria
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Sangria</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="valorSangria">Valor</Label>
                          <Input
                            id="valorSangria"
                            type="number"
                            step="0.01"
                            value={valorSangria}
                            onChange={(e) => setValorSangria(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="motivoSangria">Motivo</Label>
                          <Textarea
                            id="motivoSangria"
                            value={motivoSangria}
                            onChange={(e) => setMotivoSangria(e.target.value)}
                            placeholder="Descreva o motivo da sangria"
                          />
                        </div>
                        <Button
                          onClick={handleRegistrarSangria}
                          className="w-full"
                        >
                          Confirmar Sangria
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isFecharDialogOpen}
                    onOpenChange={setIsFecharDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <DoorClosed className="mr-2 h-4 w-4" />
                        Fechar Caixa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Fechar Caixa</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="valorFinal">
                            Valor Final (Contado)
                          </Label>
                          <Input
                            id="valorFinal"
                            type="number"
                            step="0.01"
                            value={valorFinal}
                            onChange={(e) => setValorFinal(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="valorEsperado">
                            Valor Esperado (Sistema)
                          </Label>
                          <Input
                            id="valorEsperado"
                            type="number"
                            step="0.01"
                            value={valorEsperado}
                            onChange={(e) => setValorEsperado(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="observacoes">Observações</Label>
                          <Textarea
                            id="observacoes"
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            placeholder="Observações sobre o fechamento"
                          />
                        </div>
                        <Button
                          onClick={handleFecharCaixa}
                          className="w-full"
                          variant="destructive"
                        >
                          Confirmar Fechamento
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        {caixaAtual && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Inicial:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(caixaAtual.valorInicial)}
                </span>
              </div>
              {caixaAtual.valorFinal !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Final:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(caixaAtual.valorFinal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diferença:</span>
                    <span
                      className={`font-semibold ${caixaAtual.calcularDiferenca() >= 0 ? "text-success" : "text-destructive"}`}
                    >
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(caixaAtual.calcularDiferenca())}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
