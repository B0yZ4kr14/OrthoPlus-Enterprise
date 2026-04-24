import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { ICONE_OPTIONS } from "./types";

interface BasicInfoFieldsProps {
  nome: string;
  descricao?: string;
  icone: string;
  onUpdate: (field: "nome" | "descricao" | "icone", value: string) => void;
}

export function BasicInfoFields({ nome, descricao, icone, onUpdate }: BasicInfoFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Badge *</Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => onUpdate("nome", e.target.value)}
          placeholder="Ex: Paciente VIP"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={descricao || ""}
          onChange={(e) => onUpdate("descricao", e.target.value)}
          placeholder="Descreva como conquistar esta badge..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icone">Ícone *</Label>
        <Select value={icone} onValueChange={(value) => onUpdate("icone", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ICONE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
