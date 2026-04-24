import { Input } from "@orthoplus/core-ui/input";
import { Button } from "@orthoplus/core-ui/button";
import { Label } from "@orthoplus/core-ui/label";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { CryptoWallet } from "@/modules/crypto/types/crypto.types";

interface AddressDisplayProps {
  wallet: CryptoWallet;
}

export function AddressDisplay({ wallet }: AddressDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.wallet_address);
    toast.success("Endereço copiado!");
  };

  return (
    <div className="space-y-2">
      <Label>Endereço da Carteira</Label>
      <div className="flex gap-2">
        <Input
          value={wallet.wallet_address}
          readOnly
          className="font-mono text-sm"
        />
        <Button variant="outline" size="icon" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
