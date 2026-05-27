import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  cryptoWalletSchema,
  type ExchangeConfig,
} from "@/modules/crypto/types/crypto.types";
import type { WalletFormProps } from "./types";

export function useWalletForm(
  onSubmit: WalletFormProps["onSubmit"],
  initialData?: z.infer<typeof cryptoWalletSchema>
) {
  const form = useForm<z.infer<typeof cryptoWalletSchema>>({
    resolver: zodResolver(cryptoWalletSchema) as Resolver<z.infer<typeof cryptoWalletSchema>>,
    defaultValues: {
      wallet_name: initialData?.wallet_name || "",
      coin_type: initialData?.coin_type || "BTC",
      wallet_address: initialData?.wallet_address || "",
      is_active: initialData?.is_active ?? true,
      balance: initialData?.balance || 0,
      balance_brl: initialData?.balance_brl || 0,
      exchange_config_id: initialData?.exchange_config_id || undefined,
    },
  });

  return form;
}
