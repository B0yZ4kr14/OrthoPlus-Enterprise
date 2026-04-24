// cspell:disable
import type { SplitConfigFormData } from "./types";

export const DEFAULT_FORM_DATA: Partial<SplitConfigFormData> = {
  dentist_id: "",
  procedimento_id: null,
  percentual_dentista: 50,
  percentual_clinica: 50,
  tipo_split: "PROCEDIMENTO",
  ativo: true,
};
