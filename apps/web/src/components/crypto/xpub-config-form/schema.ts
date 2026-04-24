// cspell:disable
import { z } from "zod";

export const xpubConfigSchema = z.object({
  wallet_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  hardware_type: z.string().min(1, "Selecione o tipo de hardware wallet"),
  xpub: z
    .string()
    .min(100, "xPub inválido - muito curto")
    .regex(/^(xpub|ypub|zpub|tpub|upub|vpub)[a-zA-Z0-9]+$/, "Formato de xPub inválido"),
  derivation_path: z.string().default("m/84'/0'/0'/0"),
  address_type: z.string().default("p2wpkh"),
  notes: z.string().optional(),
});

export type XPubConfigFormValues = z.infer<typeof xpubConfigSchema>;

export interface XPubConfigFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}
