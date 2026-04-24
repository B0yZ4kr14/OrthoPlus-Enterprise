// cspell:disable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { PacienteAnalises } from "./types";

interface PatientSelectorProps {
  pacientes: PacienteAnalises[];
  selectedPatientId: string;
  onSelect: (patientId: string) => void;
}

export function PatientSelector({
  pacientes,
  selectedPatientId,
  onSelect,
}: PatientSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        Selecione um Paciente
      </label>
      <Select value={selectedPatientId} onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Escolha um paciente..." />
        </SelectTrigger>
        <SelectContent>
          {pacientes.map((paciente) => (
            <SelectItem key={paciente.patientId} value={paciente.patientId}>
              {paciente.patientName} ({paciente.analises.length} análises)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
