// cspell:disable
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import {
  xpubConfigSchema,
  type XPubConfigFormValues,
  type XPubConfigFormProps,
} from "./schema";

export function useXPubConfig({ onSuccess }: XPubConfigFormProps) {
  const [testingXPub, setTestingXPub] = useState(false);
  const [testAddress, setTestAddress] = useState<string>("");
  const [isValid, setIsValid] = useState(false);

  const form = useForm<XPubConfigFormValues>({
    resolver: zodResolver(xpubConfigSchema) as Resolver<XPubConfigFormValues>,
    defaultValues: {
      wallet_name: "",
      hardware_type: "trezor",
      xpub: "",
      derivation_path: "m/84'/0'/0'/0",
      address_type: "p2wpkh",
      notes: "",
    },
  });

  const handleTestXPub = async () => {
    const xpub = form.getValues("xpub");
    const derivationPath = form.getValues("derivation_path");

    if (!xpub) {
      toast.error("Insira a xPub antes de testar");
      return;
    }

    setTestingXPub(true);
    try {
      const data = await apiClient.post<Record<string, string>>(
        "/crypto/wallet/validate-xpub",
        {
          xpub,
          derivationPath,
          index: 0,
        },
      );

      setTestAddress(data.address);
      setIsValid(true);
      toast.success("xPub validado com sucesso!");
    } catch (error: unknown) {
      logger.error("Error validating xPub:", error);
      toast.error("xPub inválido ou erro ao validar");
      setIsValid(false);
    } finally {
      setTestingXPub(false);
    }
  };

  const onSubmit = async (values: XPubConfigFormValues) => {
    if (!isValid) {
      toast.error("Por favor, teste a xPub antes de salvar");
      return;
    }

    try {
      await apiClient.post("/crypto/wallet/offline", {
        action: "create",
        ...values,
      });

      toast.success("Wallet offline configurada com sucesso!");
      form.reset();
      setTestAddress("");
      setIsValid(false);
      onSuccess?.();
    } catch (error: unknown) {
      logger.error("Error saving offline wallet:", error);
      toast.error("Erro ao salvar configuração");
    }
  };

  return {
    form,
    testingXPub,
    testAddress,
    isValid,
    handleTestXPub,
    onSubmit,
  };
}
