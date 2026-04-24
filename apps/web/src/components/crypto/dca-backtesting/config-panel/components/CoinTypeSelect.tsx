import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { CoinType } from "../types";

interface CoinTypeSelectProps {
  value: CoinType;
  onChange: (value: CoinType) => void;
}

const coinOptions = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "USDT", label: "Tether (USDT)" },
];

export function CoinTypeSelect({ value, onChange }: CoinTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Criptomoeda</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as CoinType)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {coinOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
