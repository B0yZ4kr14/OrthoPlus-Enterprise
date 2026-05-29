import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";

interface SourceSelectProps {
  value: string;
  sources: string[];
  onChange: (value: string) => void;
}

export function SourceSelect({ value, sources, onChange }: SourceSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="source">Fonte</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="source">
          <SelectValue placeholder="Selecione uma fonte" />
        </SelectTrigger>
        <SelectContent>
          {sources.map((source) => (
            <SelectItem key={source} value={source}>
              {source}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
