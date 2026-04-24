// cspell:disable
import { z } from "zod";

export const userFormSchema = z.object({
  full_name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(200),
  email: z.string().email("Email inválido"),
  app_role: z.enum(["ADMIN", "MEMBER"]),
  is_active: z.boolean().default(true),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export interface User {
  id: string;
  email: string;
  full_name: string;
  app_role: "ADMIN" | "MEMBER";
  is_active: boolean;
}

export interface UserFormProps {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}
