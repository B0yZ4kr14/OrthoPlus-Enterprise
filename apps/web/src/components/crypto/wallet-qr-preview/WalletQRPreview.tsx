import type { WalletQRPreviewProps } from "./types";
import { useWalletQRPreview } from "./useWalletQRPreview";
import { WalletCard } from "./WalletCard";
import { QRCodeDialog } from "./QRCodeDialog";

export function WalletQRPreview({ wallet }: WalletQRPreviewProps) {
  const {
    copied,
    qrDialogOpen,
    qrCodeUrl,
    setQrDialogOpen,
    handleCopyAddress,
    handleShowQRCode,
  } = useWalletQRPreview(wallet);

  if (!wallet.is_active) return null;

  return (
    <>
      <WalletCard
        wallet={wallet}
        copied={copied}
        onCopy={handleCopyAddress}
        onShowQR={handleShowQRCode}
      />
      <QRCodeDialog
        wallet={wallet}
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        qrCodeUrl={qrCodeUrl}
        copied={copied}
        onCopy={handleCopyAddress}
      />
    </>
  );
}
