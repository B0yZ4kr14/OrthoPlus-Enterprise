import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@orthoplus/core-ui/card";
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import { Button } from "@orthoplus/core-ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { usePacientes } from "@/hooks/api/usePacientes";
import { useTISSConvenios } from "@/modules/tiss/application/hooks/useTISSConvenios";
import { useProcedimentosStore } from "@/modules/procedimentos/hooks/useProcedimentosStore";
import { useTISSGuides } from "@/modules/tiss/application/hooks/useTISSGuides";
import { guideFormSchema, type GuideFormData } from "@/modules/tiss/presentation/schemas/guideFormSchema";
import { useState } from "react";

export function TISSGuideForm() {
  const { patients, isLoading: isLoadingPatients } = usePacientes();
  const { convenios, isLoading: isLoadingConvenios } = useTISSConvenios();
  const { procedimentos } = useProcedimentosStore();
  const { createGuide, isCreating } = useTISSGuides();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GuideFormData>({
    resolver: zodResolver(guideFormSchema),
    defaultValues: {
      status: "RASCUNHO",
      service_date: new Date().toISOString().split("T")[0],
    },
  });

  const selectedProcedureCode = watch("procedure_code");

  const onSubmit = (data: GuideFormData) => {
    const amountInCents = Math.round(
      parseFloat(data.amount.replace(",", ".")) * 100
    );

    const payload = {
      guide_number: data.guide_number,
      insurance_company: data.insurance_company,
      patient_id: data.patient_id,
      procedure_code: data.procedure_code,
      procedure_name: data.procedure_name,
      amount: amountInCents,
      service_date: data.service_date,
      status: data.status || "RASCUNHO",
    };

    createGuide(payload)
      .then(() => {
        setShowSuccess(true);
        reset();
        setTimeout(() => setShowSuccess(false), 3000);
      })
      .catch(() => {
        // erro já tratado pelo hook (toast)
      });
  };

  const handleProcedureChange = (code: string) => {
    const proc = procedimentos.find((p) => p.codigo === code);
    if (proc) {
      setValue("procedure_code", code, { shouldValidate: true });
      setValue("procedure_name", proc.nome, { shouldValidate: true });
      setValue("amount", proc.valor.toFixed(2).replace(".", ","), {
        shouldValidate: true,
      });
    }
  };

  const isLoading = isLoadingPatients || isLoadingConvenios;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nova Guia TISS</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando pacientes e convênios...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Guia TISS</CardTitle>
        <CardDescription>
          Preencha os dados da guia de atendimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
            Guia TISS criada com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patient">Paciente</Label>
              <Select
                onValueChange={(val) =>
                  setValue("patient_id", val, { shouldValidate: true })
                }
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patient_id && (
                <p className="text-xs text-red-500">{errors.patient_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance">Convênio</Label>
              <Select
                onValueChange={(val) =>
                  setValue("insurance_company", val, { shouldValidate: true })
                }
              >
                <SelectTrigger id="insurance">
                  <SelectValue placeholder="Selecione o convênio" />
                </SelectTrigger>
                <SelectContent>
                  {convenios
                    .filter((c) => c.is_active)
                    .map((convenio) => (
                      <SelectItem key={convenio.id} value={convenio.nome}>
                        {convenio.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.insurance_company && (
                <p className="text-xs text-red-500">
                  {errors.insurance_company.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guide-number">Número da Guia</Label>
              <Input
                id="guide-number"
                placeholder="2025110001"
                {...register("guide_number")}
              />
              {errors.guide_number && (
                <p className="text-xs text-red-500">
                  {errors.guide_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-date">Data do Atendimento</Label>
              <Input
                id="service-date"
                type="date"
                {...register("service_date")}
              />
              {errors.service_date && (
                <p className="text-xs text-red-500">
                  {errors.service_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="procedure">Procedimento</Label>
              <Select onValueChange={handleProcedureChange}>
                <SelectTrigger id="procedure">
                  <SelectValue placeholder="Selecione o procedimento" />
                </SelectTrigger>
                <SelectContent>
                  {procedimentos.map((proc) => (
                    <SelectItem key={proc.id} value={proc.codigo}>
                      {proc.nome} ({proc.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.procedure_code && (
                <p className="text-xs text-red-500">
                  {errors.procedure_code.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                placeholder="0,00"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <input type="hidden" {...register("procedure_name")} />
          <input type="hidden" {...register("status")} />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Salvando..." : "Salvar Guia"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
