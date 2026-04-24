// cspell:disable
import { useState } from "react";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import { Badge } from "@orthoplus/core-ui/badge";
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
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import type { EventoFuturo, TipoEvento } from "./types";

interface EventoDialogProps {
  eventos: EventoFuturo[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdicionar: (evento: EventoFuturo) => void;
  onRemover: (index: number) => void;
}

export function EventoDialog({
  eventos,
  open,
  onOpenChange,
  onAdicionar,
  onRemover,
}: EventoDialogProps) {
  const [novoEvento, setNovoEvento] = useState<EventoFuturo>({
    tipo: "PROMOCAO",
    dataInicio: "",
    dataFim: "",
    impactoEstimado: 0,
    descricao: "",
  });

  const handleAdicionar = () => {
    if (!novoEvento.dataInicio || !novoEvento.dataFim || !novoEvento.descricao) {
      toast.error("Preencha todos os campos do evento");
      return;
    }
    onAdicionar(novoEvento);
    setNovoEvento({
      tipo: "PROMOCAO",
      dataInicio: "",
      dataFim: "",
      impactoEstimado: 0,
      descricao: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarDays className="w-4 h-4 mr-2" />
          Eventos Futuros ({eventos.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajuste Fino de Previsões</DialogTitle>
          <DialogDescription>
            Informe eventos futuros que impactarão o consumo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Evento</Label>
              <Select
                value={novoEvento.tipo}
                onValueChange={(v) =>
                  setNovoEvento({ ...novoEvento, tipo: v as TipoEvento })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROMOCAO">Promoção</SelectItem>
                  <SelectItem value="FERIAS">Férias/Recesso</SelectItem>
                  <SelectItem value="EXPANSAO">Expansão</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Impacto (%)</Label>
              <Input
                type="number"
                placeholder="Ex: 30 ou -20"
                value={novoEvento.impactoEstimado || ""}
                onChange={(e) =>
                  setNovoEvento({
                    ...novoEvento,
                    impactoEstimado: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={novoEvento.dataInicio}
                onChange={(e) =>
                  setNovoEvento({ ...novoEvento, dataInicio: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={novoEvento.dataFim}
                onChange={(e) =>
                  setNovoEvento({ ...novoEvento, dataFim: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              placeholder="Descreva o evento..."
              value={novoEvento.descricao}
              onChange={(e) =>
                setNovoEvento({ ...novoEvento, descricao: e.target.value })
              }
            />
          </div>
          <Button onClick={handleAdicionar} className="w-full">
            Adicionar Evento
          </Button>
          {eventos.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Eventos Configurados</h4>
              {eventos.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg mb-2"
                >
                  <div>
                    <Badge variant="outline">{e.tipo}</Badge>{" "}
                    <span className="text-sm">{e.descricao}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onRemover(i)}>
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
