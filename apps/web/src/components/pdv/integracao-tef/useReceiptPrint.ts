import { useCallback } from "react";
import type { TEFTransaction } from "./types";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function useReceiptPrint() {
  const imprimir = useCallback(
    (transacao: TEFTransaction["transacao"] | null) => {
      if (!transacao?.comprovante_cliente) return;

      const printWindow = window.open("", "", "width=300,height=600");
      if (printWindow) {
        printWindow.document.write(
          '<pre style="font-family: monospace; font-size: 12px;">',
        );
        printWindow.document.write(escapeHtml(transacao.comprovante_cliente));
        printWindow.document.write("</pre>");
        printWindow.document.close();
        printWindow.print();
      }
    },
    [],
  );

  return { imprimir };
}
