import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import {
  especialidadesDisponiveis,
  diasSemana,
} from "../../types/dentista.types";

interface Props {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
  selectedDias: number[];
  setSelectedDias: (dias: number[]) => void;
  selectedEspecialidades: string[];
  setSelectedEspecialidades: (esp: string[]) => void;
}

export function DadosProfissionaisTab({
  register,
  errors,
  setValue,
  watch,
  selectedDias,
  setSelectedDias,
  selectedEspecialidades,
  setSelectedEspecialidades,
}: Props) {
  const toggleDia = (dia: number) => {
    setSelectedDias(
      selectedDias.includes(dia)
        ? selectedDias.filter((d) => d !== dia)
        : [...selectedDias, dia],
    );
  };

  const toggleEspecialidade = (esp: string) => {
    setSelectedEspecialidades(
      selectedEspecialidades.includes(esp)
        ? selectedEspecialidades.filter((e) => e !== esp)
        : [...selectedEspecialidades, esp],
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Especialidades</Label>
        <div className="flex flex-wrap gap-2">
          {especialidadesDisponiveis.map((esp) => (
            <div key={esp} className="flex items-center space-x-2">
              <Checkbox
                id={`esp-${esp}`}
                checked={selectedEspecialidades.includes(esp)}
                onCheckedChange={() => toggleEspecialidade(esp)}
              />
              <label htmlFor={`esp-${esp}`} className="text-sm">
                {esp}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Dias de Atendimento</Label>
        <div className="flex flex-wrap gap-2">
          {diasSemana.map((dia) => (
            <div key={dia.value} className="flex items-center space-x-2">
              <Checkbox
                id={`dia-${dia.value}`}
                checked={selectedDias.includes(dia.value)}
                onCheckedChange={() => toggleDia(dia.value)}
              />
              <label htmlFor={`dia-${dia.value}`} className="text-sm">
                {dia.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Horário Início</Label>
          <Input type="time" {...register("horarioAtendimento.inicio")} />
        </div>
        <div className="space-y-2">
          <Label>Horário Fim</Label>
          <Input type="time" {...register("horarioAtendimento.fim")} />
        </div>
      </div>
    </div>
  );
}
