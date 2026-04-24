import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordProps {
  onBack: () => void;
}
