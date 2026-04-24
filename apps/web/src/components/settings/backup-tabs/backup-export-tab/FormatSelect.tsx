import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { EXPORT_FORMATS } from "./EXPORT_FORMATS";
import type { ExportFormat } from "./types";

interface FormatSelectProps {
  value: ExportFormat;
  onChange: (value: ExportFormat) => void;
}

export function FormatSelect({ value, onChange }: FormatSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Formato de Exportação</label>
      <Select value={value} onValueChange={(v) => onChange(v as ExportFormat)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EXPORT_FORMATS.map((format) => {
            const Icon = format.icon;
            return (
              <SelectItem key={format.value} value={format.value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{format.label}</p>
                    <p className="text-xs text-muted-foreground">{format.description}</p>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
