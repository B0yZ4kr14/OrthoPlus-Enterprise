import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { useHardwareWallets } from "./useHardwareWallets";
import { SecurityAlert } from "./SecurityAlert";
import { WalletForm } from "./WalletForm";
import { WalletList } from "./WalletList";

export function HardwareWalletConfig() {
  const { wallets, formData, updateField, addWallet, removeWallet } =
    useHardwareWallets();

  return (
    <div className="space-y-6">
      <SecurityAlert variant="info" />

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Carteira Offline</CardTitle>
          <CardDescription>
            Configure carteiras hardware como KRUX, Blockstream Jade, SeedSigner
            ou Coldcard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WalletForm
            formData={formData}
            onUpdate={updateField}
            onSubmit={addWallet}
          />
        </CardContent>
      </Card>

      <WalletList wallets={wallets} onRemove={removeWallet} />

      <SecurityAlert variant="psbt" />
    </div>
  );
}
