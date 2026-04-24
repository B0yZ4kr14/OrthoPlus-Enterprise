import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orthoplus/core-ui/select";
import { Switch } from "@orthoplus/core-ui/switch";
import { coresCalendario } from "../../types/dentista.types";

interface Props {
  register: any;
  setValue: any;
  watch: any;
}

export function ConfiguracoesTab({ register, setValue, watch }: Props) {
  const corCalendario = watch("corCalendario");
  const status = watch("status");
  const aceitaEmergencia = watch("aceitaEmergencia");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Cor no Calendário</Label>
        <Select value={corCalendario} onValueChange={(value) => setValue("corCalendario", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {coresCalendario.map((cor) => (
              <SelectItem key={cor} value={cor}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: cor }} />
                  {cor}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(value) => setValue("status", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
            <SelectItem value="Ferias">Férias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch checked={aceitaEmergencia} onCheckedChange={(checked) => setValue("aceitaEmergencia", checked)} />
        <Label>Aceita Emergências</Label>
      </div>

      <div className="space-y-2">
        <Label>Duração Padrão Consulta (min)</Label>
        <Input type="number" {...register("duracaoConsulta")} defaultValue={30} />
      </div>
    </div>
  );
}
