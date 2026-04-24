import type { CryptoWallet } from "@/modules/crypto/types/crypto.types";

export interface BitcoinQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: CryptoWallet[];
  onGeneratePayment: (data: {
    wallet_id: string;
    amount_crypto: number;
    patient_id?: string;
    conta_receber_id?: string;
  }) => Promise<any>;
}

export interface QRCodeState {
  selectedWallet: string;
  amount: string;
  qrCodeUrl: string;
  bitcoinUri: string;
}
