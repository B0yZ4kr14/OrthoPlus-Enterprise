import React from "react";
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Calendar } from "lucide-react";
import { WizardStepProps } from "./types";

export function BasicInfoStep({ config, setConfig }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Informações Básicas</h3>
      </div>

      <div className="space-y-2">
        <Label>Nome do Backup</Label>
        <Input
          placeholder="Ex: Backup Diário Completo"
          value={config.name}
          onChange={(e) => setConfig({ ...config, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Frequência</Label>
        <Select
          value={config.frequency}
          onValueChange={(value: "daily" | "weekly" | "monthly") =>
            setConfig({ ...config, frequency: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Diário</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Horário</Label>
        <Input
          type="time"
          value={config.timeOfDay}
          onChange={(e) =>
            setConfig({ ...config, timeOfDay: e.target.value })
          }
        />
      </div>

      {config.frequency === "weekly" && (
        <div className="space-y-2">
          <Label>Dia da Semana</Label>
          <Select
            value={config.dayOfWeek?.toString()}
            onValueChange={(value) =>
              setConfig({ ...config, dayOfWeek: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o dia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Domingo</SelectItem>
              <SelectItem value="1">Segunda</SelectItem>
              <SelectItem value="2">Terça</SelectItem>
              <SelectItem value="3">Quarta</SelectItem>
              <SelectItem value="4">Quinta</SelectItem>
              <SelectItem value="5">Sexta</SelectItem>
              <SelectItem value="6">Sábado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {config.frequency === "monthly" && (
        <div className="space-y-2">
          <Label>Dia do Mês</Label>
          <Input
            type="number"
            min="1"
            max="31"
            value={config.dayOfMonth || ""}
            onChange={(e) =>
              setConfig({
                ...config,
                dayOfMonth: parseInt(e.target.value),
              })
            }
          />
        </div>
      )}
    </div>
  );
}
