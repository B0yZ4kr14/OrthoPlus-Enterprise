import type { IntegracaoTEFProps } from "./types";
import { useTEFPayment } from "./useTEFPayment";
import { useReceiptPrint } from "./useReceiptPrint";
import { TEFPaymentForm } from "./TEFPaymentForm";
import { ReceiptDialog } from "./ReceiptDialog";

export default function IntegracaoTEF({
  vendaId,
  valorTotal,
  onSuccess,
}: IntegracaoTEFProps) {
  const {
    processando,
    tipoOperacao,
    setTipoOperacao,
    numParcelas,
    setNumParcelas,
    transacao,
    showComprovante,
    setShowComprovante,
    processar,
  } = useTEFPayment(vendaId, valorTotal, onSuccess);

  const { imprimir } = useReceiptPrint();

  return (
    <>
      <TEFPaymentForm
        valorTotal={valorTotal}
        tipoOperacao={tipoOperacao}
        onTipoChange={setTipoOperacao}
        numParcelas={numParcelas}
        onParcelasChange={setNumParcelas}
        processando={processando}
        onProcessar={processar}
      />

      <ReceiptDialog
        open={showComprovante}
        onClose={() => setShowComprovante(false)}
        transacao={transacao}
        onPrint={() => imprimir(transacao)}
      />
    </>
  );
}
