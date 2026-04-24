import type { WalletFormData, HardwareWalletType } from "../types";

export type { WalletFormData, HardwareWalletType };

export interface WalletFormProps {
  formData: WalletFormData;
  onUpdate: <K extends keyof WalletFormData>(
    field: K,
    value: WalletFormData[K],
  ) => void;
  onSubmit: () => void;
}

export interface WalletFormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  className?: string;
  helpText?: string;
}
