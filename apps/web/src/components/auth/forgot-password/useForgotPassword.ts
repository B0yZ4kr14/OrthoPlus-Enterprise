import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordValues } from "./types";

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = useCallback(async (values: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/reset-password", {
        email: values.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      setEmailSent(true);
      toast.success("Email enviado!", {
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      toast.error("Erro ao enviar email", {
        description: _e.message || "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    form,
    isLoading,
    emailSent,
    handleSubmit,
  };
}
