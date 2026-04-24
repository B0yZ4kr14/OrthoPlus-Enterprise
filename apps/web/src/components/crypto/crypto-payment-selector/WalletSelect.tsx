import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Badge } from "@orthoplus/core-ui/badge";
import type { CombinedWallet } from "./types";

interface WalletSelectProps {
  wallets: CombinedWallet[];
  value: string | undefined;
  onChange: (value: string) => void;
}

export function WalletSelect({ wallets, value, onChange }: WalletSelectProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Wallet de Recebimento</label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma wallet" />
        </SelectTrigger>
        <SelectContent>
          {wallets.map((wallet) => (
            <SelectItem key={wallet.id} value={wallet.id}>
              {wallet.wallet_name}
              <Badge variant="outline" className="ml-2">
                {wallet.type === "exchange" ? "Exchange" : "Offline"}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
