// cspell:disable
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ExchangeConfig } from "@/modules/crypto/types/crypto.types";
import { exchangeFormSchema, type ExchangeFormValues, type ConnectionStatus } from "./types";

interface UseExchangeConfigFormProps {
  onSubmit: (data: ExchangeFormValues) => Promise<void>;
  initialData?: Partial<ExchangeConfig>;
}

export function useExchangeConfigForm({ onSubmit, initialData }: UseExchangeConfigFormProps) {
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [selectedCoins, setSelectedCoins] = useState<string[]>(
    initialData?.supported_coins || ["BTC"]
  );

  const form = useForm<ExchangeFormValues>({
    resolver: zodResolver(exchangeFormSchema) as any,
    defaultValues: (initialData as any) || {
      exchange_name: "BINANCE",
      api_key: "",
      api_secret: "",
      is_active: true,
      supported_coins: ["BTC"],
      auto_convert_to_brl: false,
      conversion_threshold: 0,
      processing_fee_percentage: 0,
      wallet_address: "",
    },
  });

  const handleTestConnection = useCallback(async () => {
    const values = form.getValues();
    const { exchange_name: exchange, api_key: apiKey, api_secret: apiSecret } = values;

    if (!exchange || !apiKey || !apiSecret) {
      toast.error("Preencha Exchange, API Key e API Secret para testar");
      return;
    }

    setTestingConnection(true);
    setConnectionStatus("idle");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setConnectionStatus("success");
      toast.success("Conexão testada com sucesso!");
    } catch {
      setConnectionStatus("error");
      toast.error("Falha na conexão. Verifique suas credenciais.");
    } finally {
      setTestingConnection(false);
    }
  }, [form]);

  const handleAddCoin = useCallback((coin: string) => {
    if (!selectedCoins.includes(coin)) {
      const newCoins = [...selectedCoins, coin];
      setSelectedCoins(newCoins);
      form.setValue("supported_coins", newCoins);
    }
  }, [selectedCoins, form]);

  const handleRemoveCoin = useCallback((coin: string) => {
    const newCoins = selectedCoins.filter((c) => c !== coin);
    setSelectedCoins(newCoins);
    form.setValue("supported_coins", newCoins);
  }, [selectedCoins, form]);

  const handleSubmit = useCallback(async (data: ExchangeFormValues) => {
    await onSubmit(data);
  }, [onSubmit]);

  return {
    form,
    testingConnection,
    connectionStatus,
    selectedCoins,
    handleTestConnection,
    handleAddCoin,
    handleRemoveCoin,
    handleSubmit,
  };
}
