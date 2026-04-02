import { useState } from "react";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import { useToast } from "@/hooks/use-toast";

export interface ScanResult {
  hasContent: boolean;
  content: string;
  format?: string;
}

export function useBarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const checkPermission = async (): Promise<boolean> => {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (status.granted) {
        return true;
      }

      if (status.denied) {
        toast({
          title: "Permissão Negada",
          description:
            "Acesso à câmera foi negado. Habilite nas configurações do dispositivo.",
          variant: "destructive",
        });
        return false;
      }

      if (status.restricted || status.unknown) {
        toast({
          title: "Erro de Permissão",
          description: "Não foi possível verificar permissão da câmera.",
          variant: "destructive",
        });
        return false;
      }

      // Se não for nenhum dos casos acima, solicita permissão
      const newStatus = await BarcodeScanner.checkPermission({ force: true });
      return newStatus.granted;
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      toast({
        title: "Erro",
        description: "Erro ao verificar permissão da câmera",
        variant: "destructive",
      });
      return false;
    }
  };

  const startScan = async (): Promise<ScanResult | null> => {
    try {
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        return null;
      }

      setIsScanning(true);

      // Esconder conteúdo da página para mostrar a câmera
      document.body.classList.add("scanner-active");

      // Iniciar scanner
      await BarcodeScanner.hideBackground();
      const result = await BarcodeScanner.startScan();

      // Mostrar conteúdo novamente
      document.body.classList.remove("scanner-active");
      setIsScanning(false);

      if (result.hasContent) {
        return {
          hasContent: true,
          content: result.content,
          format: result.format,
        };
      }

      return null;
    } catch (error) {
      console.error("Erro ao escanear:", error);
      document.body.classList.remove("scanner-active");
      setIsScanning(false);

      toast({
        title: "Erro no Scanner",
        description: "Não foi possível escanear o código. Tente novamente.",
        variant: "destructive",
      });

      return null;
    }
  };

  const stopScan = async () => {
    try {
      await BarcodeScanner.stopScan();
      await BarcodeScanner.showBackground();
      document.body.classList.remove("scanner-active");
      setIsScanning(false);
    } catch (error) {
      console.error("Erro ao parar scanner:", error);
    }
  };

  return {
    isScanning,
    startScan,
    stopScan,
  };
}
