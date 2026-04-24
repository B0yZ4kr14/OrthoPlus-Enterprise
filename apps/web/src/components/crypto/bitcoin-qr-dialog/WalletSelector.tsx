import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { CryptoWallet } from "@/modules/crypto/types/crypto.types";

interface WalletSelectorProps {
  wallets: CryptoWallet[];
  selectedWallet: string;
  onSelect: (value: string) => void;
}

export function WalletSelector({
  wallets,
  selectedWallet,
  onSelect,
}: WalletSelectorProps) {
  const activeWallets = wallets.filter((w) => w.is_active);

  return (
    <div className="space-y-2">
      <Label>Carteira *</Label>
      <Select value={selectedWallet} onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione a carteira" />
        </SelectTrigger>
        <SelectContent>
          {activeWallets.map((wallet) => (
            <SelectItem key={wallet.id} value={wallet.id || "unknown"}>
              {wallet.wallet_name} ({wallet.coin_type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
