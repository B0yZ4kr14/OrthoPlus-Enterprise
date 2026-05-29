import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { HARDWARE_WALLET_OPTIONS } from "../../types";
import type { HardwareWalletType } from "../types";

interface WalletTypeSelectProps {
  value: HardwareWalletType;
  onChange: (value: HardwareWalletType) => void;
}

export function WalletTypeSelect({ value, onChange }: WalletTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="wallet-type">Tipo de Hardware</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as HardwareWalletType)}
      >
        <SelectTrigger id="wallet-type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HARDWARE_WALLET_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
              {option.recommended && " (Recomendado)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
