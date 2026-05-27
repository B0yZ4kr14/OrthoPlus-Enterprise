import { memo } from "react";
import { Card } from "@orthoplus/core-ui/card";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Loader2 } from "lucide-react";
import type { CryptoPaymentSelectorProps, CoinType } from "./types";
import { useCryptoPayment } from "./useCryptoPayment";
import { WalletSelect } from "./WalletSelect";
import { CoinSelect } from "./CoinSelect";
import { AmountAlert } from "./AmountAlert";
import { GenerateButton } from "./GenerateButton";
import { BitcoinQRCodeDialog } from "../BitcoinQRCodeDialog";

export const CryptoPaymentSelector = memo(function CryptoPaymentSelector({
  amount,
  onPaymentConfirmed,
}: CryptoPaymentSelectorProps) {
  const {
    allWallets,
    selectedWallet,
    setSelectedWallet,
    selectedCoin,
    setSelectedCoin,
    paymentData,
    qrDialogOpen,
    setQrDialogOpen,
    generatingAddress,
    loadingData,
    generatePayment,
    handlePaymentGenerated,
  } = useCryptoPayment(amount, onPaymentConfirmed);

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allWallets.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Nenhuma wallet configurada. Configure uma exchange ou wallet offline
          nas Configurações.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <WalletSelect
            wallets={allWallets}
            value={selectedWallet}
            onChange={setSelectedWallet}
          />

          <CoinSelect value={selectedCoin} onChange={setSelectedCoin} />

          <AmountAlert amount={amount} coin={selectedCoin} />

          <GenerateButton
            disabled={!selectedWallet}
            loading={generatingAddress}
            onClick={generatePayment}
          />
        </div>
      </Card>

      {paymentData && (
        <BitcoinQRCodeDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          wallets={[
            {
              id: "payment-request",
              wallet_address: paymentData.address,
              coin_type: paymentData.coin as CoinType,
              wallet_name: `Pagamento ${paymentData.coin}`,
              balance: 0,
              balance_brl: 0,
              is_active: true,
            },
          ]}
          onGeneratePayment={async () => { handlePaymentGenerated(); }}
        />
      )}
    </div>
  );
});
