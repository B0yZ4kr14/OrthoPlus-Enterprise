/**
 * FASE 0 - T0.4: AUTO-FOCUS INPUT
 * Campo de input que automaticamente foca no próximo campo quando atinge maxLength
 * e volta para o campo anterior ao pressionar Backspace em campo vazio
 */

export interface AutoFocusInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxLength: number;
  nextInputRef?: React.RefObject<HTMLInputElement>;
  previousInputRef?: React.RefObject<HTMLInputElement>;
  value: string;
  onValueChange: (value: string) => void;
  mask?: "cpf" | "phone" | "cep" | "date" | "cnpj";
}

export type MaskType = AutoFocusInputProps["mask"];
