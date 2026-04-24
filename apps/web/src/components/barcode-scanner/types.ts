export interface BarcodeScannerProps {
  onScan: (code: string, format?: string) => void;
  onCancel?: () => void;
  className?: string;
}

export type ScannerState = "idle" | "scanning";
