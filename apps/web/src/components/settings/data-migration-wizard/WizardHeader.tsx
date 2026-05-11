// cspell:disable
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@orthoplus/core-ui/dialog";
import { Download, Upload } from "lucide-react";

interface WizardHeaderProps {
  mode: "export" | "import";
}

export function WizardHeader({ mode }: WizardHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        {mode === "export" ? <Download className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
        {mode === "export" ? "Exportar Dados" : "Importar Dados"}
      </DialogTitle>
      <DialogDescription>
        {mode === "export"
          ? "Exporte dados da clínica para backup ou migração"
          : "Importe dados de outro sistema OrthoPlus Enterprise ou arquivo de backup"}
      </DialogDescription>
    </DialogHeader>
  );
}
