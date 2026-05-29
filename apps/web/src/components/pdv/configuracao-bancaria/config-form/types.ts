import type { BancoConfig, Banco } from "../types";

export type { BancoConfig, Banco };

export interface ConfigFormProps {
  editando: BancoConfig;
  bancos: Banco[];
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: <K extends keyof BancoConfig>(
    field: K,
    value: BancoConfig[K],
  ) => void;
}

export interface BancoSelectProps {
  bancos: Banco[];
  value: string;
  onChange: (value: string) => void;
}

export interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}
