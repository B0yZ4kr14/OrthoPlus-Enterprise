import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type Dentista,
  dentistaSchema,
} from "../../types/dentista.types";

interface UseDentistaFormProps {
  dentista?: Dentista;
  onSubmit: (data: Dentista) => void;
}

interface UseDentistaFormReturn {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  register: any;
  handleSubmit: any;
  errors: any;
  setValue: any;
  watch: any;
  selectedDias: number[];
  setSelectedDias: (dias: number[]) => void;
  selectedEspecialidades: string[];
  setSelectedEspecialidades: (esp: string[]) => void;
  handleFormSubmit: (data: Dentista) => void;
}

export function useDentistaForm({
  dentista,
  onSubmit,
}: UseDentistaFormProps): UseDentistaFormReturn {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    dentista?.avatar_url || null
  );
  const [selectedDias, setSelectedDias] = useState<number[]>(
    dentista?.diasAtendimento || []
  );
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<string[]>(
    dentista?.especialidades || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Dentista>({
    resolver: zodResolver(dentistaSchema) as unknown as Resolver<Dentista>,
    defaultValues: dentista || {
      status: "Ativo",
      especialidades: [],
      diasAtendimento: [],
      horariosAtendimento: {
        inicio: "08:00",
        fim: "18:00",
      },
    },
  });

  useEffect(() => {
    setValue("diasAtendimento", selectedDias);
  }, [selectedDias, setValue]);

  useEffect(() => {
    setValue("especialidades", selectedEspecialidades);
  }, [selectedEspecialidades, setValue]);

  useEffect(() => {
    if (avatarUrl) {
      setValue("avatar_url", avatarUrl);
    }
  }, [avatarUrl, setValue]);

  const handleFormSubmit = (data: Dentista) => {
    onSubmit({
      ...data,
      avatar_url: avatarUrl,
      diasAtendimento: selectedDias,
      especialidades: selectedEspecialidades,
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
    selectedEspecialidades,
    setSelectedEspecialidades,
    handleFormSubmit,
  };
}
