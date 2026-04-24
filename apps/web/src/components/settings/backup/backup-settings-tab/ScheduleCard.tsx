import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Label } from "@orthoplus/core-ui/label";
import { Switch } from "@orthoplus/core-ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";

const FREQUENCY_OPTIONS = [
  { value: "hourly", label: "A cada hora" },
  { value: "daily", label: "Diariamente" },
  { value: "weekly", label: "Semanalmente" },
  { value: "monthly", label: "Mensalmente" },
];

const TIME_OPTIONS = [
  { value: "00:00", label: "00:00" },
  { value: "06:00", label: "06:00" },
  { value: "12:00", label: "12:00" },
  { value: "18:00", label: "18:00" },
];

export function ScheduleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Agendamento Automático</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Backup Automático</Label>
            <p className="text-sm text-muted-foreground">Criar backups automaticamente</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="space-y-2">
          <Label>Frequência</Label>
          <Select defaultValue="daily">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Horário</Label>
          <Select defaultValue="18:00">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
