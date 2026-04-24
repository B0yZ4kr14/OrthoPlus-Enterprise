// cspell:disable
import { z } from "zod";
import { exchangeConfigSchema } from "@/modules/crypto/types/crypto.types";

export const AVAILABLE_COINS = ["BTC", "ETH", "USDT", "BNB", "USDC"];

export const exchangeFormSchema = z.object({
  exchange_name: exchangeConfigSchema.shape.exchange_name,
  api_key: z
    .string()
    .min(16, "API Key deve ter no mínimo 16 caracteres")
    .max(128, "API Key muito longa"),
  api_secret: z
    .string()
    .min(16, "API Secret deve ter no mínimo 16 caracteres")
    .max(256, "API Secret muito longo"),
  wallet_address: z.string().optional(),
  supported_coins: z.array(z.string()).min(1, "Selecione pelo menos uma moeda"),
  auto_convert_to_brl: z.boolean().default(false),
  conversion_threshold: z.number().min(0).default(0),
  processing_fee_percentage: z.number().min(0).max(100).default(0),
  is_active: z.boolean().default(true),
});

export type ExchangeFormValues = z.infer<typeof exchangeFormSchema>;

export type ConnectionStatus = "idle" | "success" | "error";
