// cspell:disable
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fornecedorSchema, type Fornecedor } from "../../types/estoque.types";

interface UseFornecedorFormProps {
  fornecedor?: Fornecedor;
  onSubmit: (data: Fornecedor) => void;
}

const defaultValues: Partial<Fornecedor> = {
  nome: "",
  razaoSocial: "",
  cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  observacoes: "",
  ativo: true,
  apiEnabled: false,
  apiEndpoint: "",
  apiAuthType: "none",
  apiUsername: "",
  apiPassword: "",
  apiToken: "",
  apiKeyHeader: "",
  apiKeyValue: "",
  apiRequestFormat: "json",
  autoOrderEnabled: false,
};

export function useFornecedorForm({
  fornecedor,
  onSubmit,
}: UseFornecedorFormProps) {
  const form = useForm<Fornecedor, any, Fornecedor>({
    resolver: zodResolver(fornecedorSchema) as Resolver<Fornecedor>,
    defaultValues: fornecedor || defaultValues,
  });

  const handleSubmit = form.handleSubmit(onSubmit);
  const apiEnabled = form.watch("apiEnabled");
  const apiAuthType = form.watch("apiAuthType");

  return {
    form,
    handleSubmit,
    apiEnabled,
    apiAuthType,
    isEditing: !!fornecedor,
  };
}
