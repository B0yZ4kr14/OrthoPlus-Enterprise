import { cn } from "@/lib/utils";
import type { BarcodeScannerProps } from "./types";
import { useScanner } from "./useScanner";
import { InstructionsCard } from "./InstructionsCard";
import { ScanningOverlay } from "./ScanningOverlay";
import { ScannerStyles } from "./ScannerStyles";

export function BarcodeScanner({ onScan, onCancel, className }: BarcodeScannerProps) {
  const { isScanning, showInstructions, handleStartScan, handleCancel } = useScanner({
    onScan,
    onCancel,
  });

  return (
    <div className={cn("relative", className)}>
      {showInstructions && !isScanning && (
        <InstructionsCard onStart={handleStartScan} onCancel={onCancel} />
      )}
      {isScanning && <ScanningOverlay onCancel={handleCancel} />}
      <ScannerStyles />
    </div>
  );
}
