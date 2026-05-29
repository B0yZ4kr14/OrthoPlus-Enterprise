// cspell:disable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { tipoRadiografiaLabels } from "../../types/radiografia.types";
import type { AnaliseComplete } from "../../types/radiografia.types";

interface AnaliseSelectorProps {
  analises: AnaliseComplete[];
  analise1Id: string;
  analise2Id: string;
  onAnalise1Change: (id: string) => void;
  onAnalise2Change: (id: string) => void;
}

export function AnaliseSelector({
  analises,
  analise1Id,
  analise2Id,
  onAnalise1Change,
  onAnalise2Change,
}: AnaliseSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Primeira Análise
        </label>
        <Select value={analise1Id} onValueChange={onAnalise1Change}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {analises.map((analise) => (
              <SelectItem key={analise.id ?? ""} value={analise.id ?? ""}>
                {new Date(analise.created_at ?? "").toLocaleDateString("pt-BR")}{" "}
                -{" "}
                {
                  tipoRadiografiaLabels[
                    analise.tipo_radiografia as keyof typeof tipoRadiografiaLabels
                  ]
                }
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Segunda Análise
        </label>
        <Select value={analise2Id} onValueChange={onAnalise2Change}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {analises.map((analise) => (
              <SelectItem key={analise.id ?? ""} value={analise.id ?? ""}>
                {new Date(analise.created_at ?? "").toLocaleDateString("pt-BR")}{" "}
                -{" "}
                {
                  tipoRadiografiaLabels[
                    analise.tipo_radiografia as keyof typeof tipoRadiografiaLabels
                  ]
                }
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
