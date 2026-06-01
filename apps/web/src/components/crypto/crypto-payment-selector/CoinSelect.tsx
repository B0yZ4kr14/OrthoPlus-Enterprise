import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { CoinType } from "./types";
import { COIN_OPTIONS } from "./types";

interface CoinSelectProps {
  value: CoinType;
  onChange: (value: CoinType) => void;
}

export function CoinSelect({ value, onChange }: CoinSelectProps) {
  return (
    <div>
      <label htmlFor="crypto-currency" className="text-sm font-medium mb-2 block">Criptomoeda</label>
      <Select value={value} onValueChange={(v) => onChange(v as CoinType)}>
        <SelectTrigger id="crypto-currency">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COIN_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
