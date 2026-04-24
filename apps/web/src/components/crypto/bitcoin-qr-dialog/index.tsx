import {
  Dialog,
  DialogContent,
} from "@orthoplus/core-ui/dialog";
import type { BitcoinQRCodeDialogProps } from "./types";
import { useQRCodeGeneration } from "./useQRCodeGeneration";
import { usePaymentSubmission } from "./usePaymentSubmission";
import { WalletSelector } from "./WalletSelector";
import { AmountInput } from "./AmountInput";
import { AddressDisplay } from "./AddressDisplay";
import { useBitcoinQRDialog } from "./hooks/useBitcoinQRDialog";
import { DialogTitleHeader } from "./components/DialogTitleHeader";
import { ActionSection } from "./components/ActionSection";

export * from "./types";
export { useBitcoinQRDialog, DialogTitleHeader, ActionSection };

export function BitcoinQRCodeDialog({
  open,
  onOpenChange,
  wallets,
  onGeneratePayment,
}: BitcoinQRCodeDialogProps) {
  const {
    selectedWallet,
    setSelectedWallet,
    amount,
    setAmount,
    resetForm,
    handleDownloadQR,
  } = useBitcoinQRDialog(wallets, onOpenChange);

  const { qrCodeUrl, bitcoinUri, wallet } = useQRCodeGeneration(
    selectedWallet,
    amount,
    wallets,
  );

  const { submit, isSubmitting } = usePaymentSubmission(
    onGeneratePayment,
    () => onOpenChange(false),
    resetForm,
  );

  const handleDownload = () => {
    handleDownloadQR(qrCodeUrl, amount, wallet?.coin_type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitleHeader />

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <WalletSelector
              wallets={wallets}
              selectedWallet={selectedWallet}
              onSelect={setSelectedWallet}
            />
            <AmountInput
              value={amount}
              onChange={setAmount}
              coinType={wallet?.coin_type}
            />
          </div>

          {wallet && <AddressDisplay wallet={wallet} />}

          <ActionSection
            qrCodeUrl={qrCodeUrl}
            bitcoinUri={bitcoinUri}
            amount={amount}
            coinType={wallet?.coin_type}
            isSubmitting={isSubmitting}
            onDownload={handleDownload}
            onSubmit={() => submit(selectedWallet, amount)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
