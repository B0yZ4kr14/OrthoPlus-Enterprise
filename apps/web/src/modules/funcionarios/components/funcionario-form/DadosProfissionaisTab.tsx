import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import { Calendar } from "@orthoplus/core-ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@orthoplus/core-ui/popover";
import { formatDate } from "@/lib/utils/date.utils";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@orthoplus/core-ui/button";
import { cargosDisponiveis, diasSemana } from "../../types/funcionario.types";

interface DadosProfissionaisTabProps {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
  selectedDias: number[];
  setSelectedDias: (dias: number[]) => void;
}

export function DadosProfissionaisTab({
  register,
  errors,
  setValue,
  watch,
  selectedDias,
  setSelectedDias,
}: DadosProfissionaisTabProps) {
  const dataAdmissao = watch("dataAdmissao");
  const cargo = watch("cargo");

  const toggleDia = (dia: number) => {
    if (selectedDias.includes(dia)) {
      setSelectedDias(selectedDias.filter((d) => d !== dia));
    } else {
      setSelectedDias([...selectedDias, dia]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo *</Label>
          <Select
            value={cargo}
            onValueChange={(value) => setValue("cargo", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              {cargosDisponiveis.map((cargoItem) => (
                <SelectItem key={cargoItem} value={cargoItem}>
                  {cargoItem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.cargo && (
            <p className="text-sm text-destructive">{String(errors.cargo.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Data de Admissão</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataAdmissao && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataAdmissao ? (
                  formatDate(dataAdmissao)
                ) : (
                  "Selecione uma data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataAdmissao ? new Date(dataAdmissao) : undefined}
                onSelect={(date) =>
                  setValue("dataAdmissao", date?.toISOString() || "")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salario">Salário</Label>
          <Input
            id="salario"
            type="number"
            step="0.01"
            {...register("salario")}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue="Ativo"
            onValueChange={(value) => setValue("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Ferias">Férias</SelectItem>
              <SelectItem value="Licenca">Licença</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Dias de Trabalho</Label>
          <div className="flex flex-wrap gap-2">
            {diasSemana.map((dia) => (
              <div key={dia.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`dia-${dia.value}`}
                  checked={selectedDias.includes(dia.value)}
                  onCheckedChange={() => toggleDia(dia.value)}
                />
                <label
                  htmlFor={`dia-${dia.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {dia.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="horarioInicio">Horário Início</Label>
            <Input
              id="horarioInicio"
              type="time"
              {...register("horarioTrabalho.inicio")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horarioFim">Horário Fim</Label>
            <Input
              id="horarioFim"
              type="time"
              {...register("horarioTrabalho.fim")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
