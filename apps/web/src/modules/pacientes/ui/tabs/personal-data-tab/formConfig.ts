import type { FormFieldConfig } from "./types";

export const personalDataFields: FormFieldConfig[] = [
  {
    name: "full_name",
    label: "Nome Completo",
    required: true,
    placeholder: "Nome completo do paciente",
  },
  {
    name: "social_name",
    label: "Nome Social",
    placeholder: "Nome social (opcional)",
  },
  {
    name: "cpf",
    label: "CPF",
    mask: "cpf",
    placeholder: "000.000.000-00",
  },
  {
    name: "rg",
    label: "RG",
    mask: "rg",
    placeholder: "00.000.000-0",
  },
  {
    name: "birth_date",
    label: "Data de Nascimento",
    required: true,
    type: "date",
  },
  {
    name: "gender",
    label: "Gênero",
    type: "select",
    options: [
      { value: "masculino", label: "Masculino" },
      { value: "feminino", label: "Feminino" },
      { value: "outro", label: "Outro" },
      { value: "nao_informar", label: "Prefiro não informar" },
    ],
  },
  {
    name: "marital_status",
    label: "Estado Civil",
    type: "select",
    options: [
      { value: "solteiro", label: "Solteiro(a)" },
      { value: "casado", label: "Casado(a)" },
      { value: "divorciado", label: "Divorciado(a)" },
      { value: "viuvo", label: "Viúvo(a)" },
      { value: "uniao_estavel", label: "União Estável" },
    ],
  },
  {
    name: "nationality",
    label: "Nacionalidade",
    placeholder: "Ex: Brasileiro",
  },
  {
    name: "occupation",
    label: "Profissão",
    placeholder: "Profissão do paciente",
  },
  {
    name: "education_level",
    label: "Escolaridade",
    type: "select",
    options: [
      { value: "fundamental", label: "Ensino Fundamental" },
      { value: "medio", label: "Ensino Médio" },
      { value: "superior", label: "Ensino Superior" },
      { value: "pos_graduacao", label: "Pós-Graduação" },
      { value: "nao_informado", label: "Não Informado" },
    ],
  },
  {
    name: "referral_source",
    label: "Indicação",
    placeholder: "Quem indicou este paciente?",
    description:
      "Nome do paciente, profissional ou parceiro que fez a indicação",
  },
];
