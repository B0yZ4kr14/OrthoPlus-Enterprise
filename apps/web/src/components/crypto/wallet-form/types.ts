import type { z } from "zod";
import type { cryptoWalletSchema, ExchangeConfig } from "@/modules/crypto/types/crypto.types";

export interface WalletFormProps {
  onSubmit: (data: z.infer<typeof cryptoWalletSchema>) => Promise<void>;
  onCancel: () => void;
  initialData?: z.infer<typeof cryptoWalletSchema>;
  exchanges?: ExchangeConfig[];
}

export type WalletFormData = z.infer<typeof cryptoWalletSchema>;
