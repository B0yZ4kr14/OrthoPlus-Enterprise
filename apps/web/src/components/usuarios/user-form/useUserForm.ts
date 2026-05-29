// cspell:disable
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import {
  userFormSchema,
  type UserFormValues,
  type UserFormProps,
} from "./types";

export function useUserForm({ user, onSuccess }: UserFormProps) {
  const { clinicId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema) as Resolver<UserFormValues>,
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      app_role: user?.app_role || "MEMBER",
      is_active: user?.is_active ?? true,
      password: "",
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    if (!clinicId) {
      toast.error("Erro", { description: "Clínica não identificada" });
      return;
    }

    setIsLoading(true);

    try {
      if (user) {
        await apiClient.patch(`/usuarios/${user.id}`, {
          full_name: values.full_name,
          app_role: values.app_role,
          is_active: values.is_active,
          password: values.password || undefined,
        });
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await apiClient.post("/usuarios", {
          email: values.email,
          password: values.password || `temp${Date.now()}`,
          full_name: values.full_name,
          app_role: values.app_role,
          is_active: values.is_active,
        });
        toast.success("Usuário criado com sucesso!", {
          description: values.password
            ? "O usuário pode fazer login com a senha fornecida."
            : "Foi enviado um email de confirmação com instruções para definir a senha.",
        });
      }

      onSuccess();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      logger.error("Erro ao salvar usuário:", error);
      toast.error("Erro ao salvar usuário", { description: _e.message });
    } finally {
      setIsLoading(false);
    }
  };

  return { form, isLoading, onSubmit };
}
