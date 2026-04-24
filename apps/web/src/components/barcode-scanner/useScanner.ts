import { useState, useCallback, useEffect } from "react";
import { useBarcodeScanner as useNativeBarcodeScanner } from "@/hooks/useBarcodeScanner";
import type { BarcodeScannerProps, ScannerState } from "./types";

export function useScanner({ onScan, onCancel }: Pick<BarcodeScannerProps, "onScan" | "onCancel">) {
  const { isScanning, startScan, stopScan } = useNativeBarcodeScanner();
  const [state, setState] = useState<ScannerState>("idle");
  const [showInstructions, setShowInstructions] = useState(true);

  const handleStartScan = useCallback(async () => {
    setShowInstructions(false);
    const result = await startScan();

    if (result?.hasContent) {
      onScan(result.content, result.format);
    }
  }, [startScan, onScan]);

  const handleCancel = useCallback(async () => {
    await stopScan();
    setShowInstructions(true);
    onCancel?.();
  }, [stopScan, onCancel]);

  useEffect(() => {
    return () => {
      void stopScan();
    };
  }, [stopScan]);

  return {
    isScanning,
    showInstructions,
    handleStartScan,
    handleCancel,
  };
}
