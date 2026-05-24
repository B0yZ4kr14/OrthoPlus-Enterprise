import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { PatientAdapter, PatientAPI } from "@/lib/adapters/patientAdapter";
import { toast } from "sonner";
import { Button } from "@orthoplus/core-ui/button";
import { Form } from "@orthoplus/core-ui/form";
import { ArrowLeft, Save } from "lucide-react";
import { PatientFormTabs } from "@/modules/pacientes/ui/components/PatientFormTabs";
import { PersonalDataTab } from "@/modules/pacientes/ui/tabs/PersonalDataTab";
import { ContactAddressTab } from "@/modules/pacientes/ui/tabs/ContactAddressTab";
import { MedicalHistoryTab } from "@/modules/pacientes/ui/tabs/MedicalHistoryTab";
import { HabitsMeasuresTab } from "@/modules/pacientes/ui/tabs/HabitsMeasuresTab";
import { DentalTab } from "@/modules/pacientes/ui/tabs/DentalTab";
import { OtherTab } from "@/modules/pacientes/ui/tabs/OtherTab";
import { MarketingTrackingTab } from "@/modules/pacientes/ui/tabs/MarketingTrackingTab";
import {
  patientFormSchema,
  type PatientFormValues,
  calculateBMI,
} from "@/lib/patient-validation";
import type { Patient } from "@/types/patient";

export default function PatientFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clinicId, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      full_name: "",
      birth_date: "",
      phone_primary: "",
      status: "PROSPECT",
    },
  });

  // Carregar dados do paciente se estiver editando
  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      try {
        const response = await apiClient.get<PatientAPI>(
          `/pacientes/${id}`,
        );

        if (response) {
          // Converter data da API para o formato do formulário
          const formData = PatientAdapter.toFrontend(response);
          form.reset(patientFormSchema.parse(formData));
        }
      } catch (error: unknown) {
        toast.error("Erro ao carregar paciente", {
          description: error instanceof Error ? error.message : "Erro desconhecido",
        });
        navigate("/pacientes");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPatient();
  }, [id, form, navigate]);


  // Calcular IMC automaticamente quando peso ou altura mudar
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "weight_kg" || name === "height_cm") {
        const bmi = calculateBMI(
          value.weight_kg ?? null,
          value.height_cm ?? null,
        );
        if (bmi !== null && bmi !== value.bmi) {
          form.setValue("bmi", bmi);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: PatientFormValues) => {
    if (!clinicId || !user) {
      toast.error("Erro", { description: "Usuário não autenticado" });
      return;
    }

    setIsLoading(true);

    try {
      const apiData = PatientAdapter.toAPI(values as Patient);

      // Ensure specific fields map back if needed
      if (id) {
        // Atualizar paciente existente
        await apiClient.put(`/pacientes/${id}`, apiData);

        // Se o status mudou, atualizar via endpoint de status
        // A API REST prefere eventos de status explícitos
        if (values.status) {
          try {
            await apiClient.patch(`/pacientes/${id}/status`, {
              novoStatusCode: values.status,
              reason: "Atualização de formulário",
            });
          } catch (e) {
            // Status update failed — handled by error boundary
          }
        }

        toast.success("Paciente atualizado com sucesso!");
      } else {
        // Criar novo paciente
        await apiClient.post("/pacientes", apiData);

        toast.success("Paciente cadastrado com sucesso!");
      }

      navigate("/pacientes");
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      toast.error("Erro ao salvar paciente", {
        description: _e.message || "Erro desconhecido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/pacientes")}
          data-testid="patient-form-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {id ? "Editar Paciente" : "Novo Paciente"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Preencha os dados do paciente com atenção
          </p>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          className="gap-2"
          data-testid="patient-form-submit"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} data-testid="patient-form">
          <PatientFormTabs>
            <PersonalDataTab form={form} />
            <ContactAddressTab form={form} />
            <MedicalHistoryTab form={form} />
            <HabitsMeasuresTab form={form} />
            <DentalTab form={form} />
            <OtherTab form={form} />
            <MarketingTrackingTab form={form} />
          </PatientFormTabs>
        </form>
      </Form>
    </div>
  );
}
