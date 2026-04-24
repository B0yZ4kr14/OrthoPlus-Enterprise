import { Button } from "@orthoplus/core-ui/button";
import { Loader2, Download } from "lucide-react";

interface ExportButtonProps {
  isExporting: boolean;
  onClick: () => void;
}

export function ExportButton({ isExporting, onClick }: ExportButtonProps) {
  return (
    <Button onClick={onClick} disabled={isExporting} className="w-full">
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Exportar Dados
        </>
      )}
    </Button>
  );
}
