import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import type { ContasReceberFormData } from "./ContasReceberFilters";

interface NovaContaWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ContasReceberFormData) => Promise<void>;
}

export function NovaContaWizard({
  open,
  onOpenChange,
  onSubmit,
}: NovaContaWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContasReceberFormData>({
    patient_name: "",
    descricao: "",
    valor: "",
    data_vencimento: "",
    parcelas: "1",
    observacoes: "",
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // reset when closing
      setStep(1);
      setFormData({
        patient_name: "",
        descricao: "",
        valor: "",
        data_vencimento: "",
        parcelas: "1",
        observacoes: "",
      });
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }
    await onSubmit(formData);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova Conta a Receber</DialogTitle>
          <DialogDescription id="wizard-description">
            Passo {step} de 3 -{" "}
            {step === 1
              ? "Dados do Cliente"
              : step === 2
                ? "Detalhes de Pagamento"
                : "Confirmação"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} aria-describedby="wizard-description">
          <div className="py-4">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="patient_name">
                    Cliente/Paciente <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="patient_name"
                    placeholder="Nome completo do paciente"
                    value={formData.patient_name}
                    onChange={(e) =>
                      setFormData({ ...formData, patient_name: e.target.value })
                    }
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">
                    Descrição do Serviço{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="descricao"
                    placeholder="Ex: Tratamento Ortodôntico Mensal"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    required
                    aria-required="true"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor">
                      Valor Total (R$){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.valor}
                      onChange={(e) =>
                        setFormData({ ...formData, valor: e.target.value })
                      }
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_vencimento">
                      Data de Vencimento{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      value={formData.data_vencimento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          data_vencimento: e.target.value,
                        })
                      }
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="parcelas">Número de Parcelas</Label>
                    <Input
                      id="parcelas"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={formData.parcelas}
                      onChange={(e) =>
                        setFormData({ ...formData, parcelas: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações Adicionais</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais como forma de pagamento preferencial ou descontos..."
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div className="bg-muted p-4 rounded-md text-sm mt-4 border border-input">
                  <h4 className="font-semibold mb-2">Resumo da Conta</h4>
                  <div className="grid grid-cols-2 gap-y-1">
                    <span className="text-muted-foreground">Paciente:</span>{" "}
                    <span>{formData.patient_name}</span>
                    <span className="text-muted-foreground">
                      Descrição:
                    </span>{" "}
                    <span>{formData.descricao}</span>
                    <span className="text-muted-foreground">Valor:</span>{" "}
                    <span className="font-bold text-primary">
                      R${" "}
                      {parseFloat(formData.valor || "0").toLocaleString(
                        "pt-BR",
                        { minimumFractionDigits: 2 },
                      )}
                    </span>
                    <span className="text-muted-foreground">Vencimento:</span>{" "}
                    <span>{formData.data_vencimento}</span>
                    <span className="text-muted-foreground">
                      Parcelas:
                    </span>{" "}
                    <span>{formData.parcelas || 1}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between w-full sm:justify-between items-center mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? () => handleOpenChange(false) : prevStep}
            >
              {step === 1 ? "Cancelar" : "Voltar"}
            </Button>
            <Button type="submit" variant="default" className="min-w-[120px]">
              {step === 3 ? "Salvar Conta" : "Próximo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
