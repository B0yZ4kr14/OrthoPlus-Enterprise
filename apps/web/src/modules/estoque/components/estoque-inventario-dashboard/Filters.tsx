// cspell:disable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";

interface FiltersProps {
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
}

export function Filters({ selectedPeriod, onPeriodChange }: FiltersProps) {
  return (
    <div className="flex gap-4">
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Últimos 7 dias</SelectItem>
          <SelectItem value="30">Últimos 30 dias</SelectItem>
          <SelectItem value="90">Últimos 90 dias</SelectItem>
          <SelectItem value="180">Últimos 6 meses</SelectItem>
          <SelectItem value="365">Último ano</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
