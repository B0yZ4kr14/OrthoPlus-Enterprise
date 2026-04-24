import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type Funcionario,
  funcionarioSchema,
  type Permissoes,
} from "../../types/funcionario.types";

interface UseFuncionarioFormProps {
  funcionario?: Funcionario;
  onSubmit: (data: Funcionario) => void;
}

interface UseFuncionarioFormReturn {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  register: ReturnType<typeof useForm<Funcionario>>["register"];
  handleSubmit: ReturnType<typeof useForm<Funcionario>>["handleSubmit"];
  errors: ReturnType<typeof useForm<Funcionario>>["formState"]["errors"];
  setValue: ReturnType<typeof useForm<Funcionario>>["setValue"];
  watch: ReturnType<typeof useForm<Funcionario>>["watch"];
  selectedDias: number[];
  setSelectedDias: (dias: number[]) => void;
  permissoes: Permissoes;
  setPermissoes: (permissoes: Permissoes) => void;
  handleFormSubmit: (data: Funcionario) => void;
}

export function useFuncionarioForm({
  funcionario,
  onSubmit,
}: UseFuncionarioFormProps): UseFuncionarioFormReturn {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    funcionario?.avatar_url || null
  );
  const [selectedDias, setSelectedDias] = useState<number[]>(
    funcionario?.diasTrabalho || []
  );
  const [permissoes, setPermissoes] = useState<Permissoes>(
    funcionario?.permissoes || {}
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Funcionario>({
    resolver: zodResolver(funcionarioSchema) as unknown as Resolver<Funcionario>,
    defaultValues: funcionario || {
      status: "Ativo",
      permissoes: {},
      diasTrabalho: [],
      horarioTrabalho: {
        inicio: "08:00",
        fim: "18:00",
      },
    },
  });

  useEffect(() => {
    setValue("diasTrabalho", selectedDias);
  }, [selectedDias, setValue]);

  useEffect(() => {
    setValue("permissoes", permissoes);
  }, [permissoes, setValue]);

  useEffect(() => {
    if (avatarUrl) {
      setValue("avatar_url", avatarUrl);
    }
  }, [avatarUrl, setValue]);

  const handleFormSubmit = (data: Funcionario) => {
    onSubmit({
      ...data,
      avatar_url: avatarUrl,
      diasTrabalho: selectedDias,
      permissoes,
    });
  };

  return {
    avatarUrl,
    setAvatarUrl,
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    selectedDias,
    setSelectedDias,
    permissoes,
    setPermissoes,
    handleFormSubmit,
  };
}
