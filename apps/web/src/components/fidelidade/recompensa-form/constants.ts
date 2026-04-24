// cspell:disable
import type { TipoRecompensa } from "./types";

export const TIPO_OPCOES: { value: TipoRecompensa; label: string }[] = [
  { value: "BRINDE", label: "Brinde" },
  { value: "DESCONTO_PERCENTUAL", label: "Desconto %" },
  { value: "DESCONTO_VALOR", label: "Desconto Valor" },
  { value: "PROCEDIMENTO_GRATIS", label: "Procedimento Grátis" },
];

export const DEFAULT_FORM_DATA = {
  nome: "",
  descricao: "",
  pontos_necessarios: 100,
  tipo: "BRINDE" as TipoRecompensa,
  valor_desconto: null,
  procedimento_id: null,
  ativo: true,
};
