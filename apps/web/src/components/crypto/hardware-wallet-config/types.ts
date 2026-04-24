export type HardwareWalletType =
  | "krux"
  | "jade"
  | "seedsigner"
  | "coldcard"
  | "other";

export interface HardwareWallet {
  id: string;
  name: string;
  type: HardwareWalletType;
  xpub: string;
  fingerprint: string;
  multisig: boolean;
  isActive: boolean;
}

export interface WalletFormData {
  name: string;
  type: HardwareWalletType;
  xpub: string;
  fingerprint: string;
  multisig: boolean;
}

export const HARDWARE_WALLET_OPTIONS: Array<{
  value: HardwareWalletType;
  label: string;
  recommended?: boolean;
}> = [
  { value: "krux", label: "KRUX", recommended: true },
  { value: "jade", label: "Blockstream Jade" },
  { value: "seedsigner", label: "SeedSigner" },
  { value: "coldcard", label: "Coldcard" },
  { value: "other", label: "Outro" },
];
