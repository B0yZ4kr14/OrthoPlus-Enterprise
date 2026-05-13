import {
  Dialog,
  DialogContent,
} from "@orthoplus/core-ui/dialog";
import type { PaymentDialogProps } from "./types";
import { usePaymentForm } from "./usePaymentForm";
import { usePaymentSubmission } from "./usePaymentSubmission";
import { PaymentMethodTabs } from "./PaymentMethodTabs";
import { PaymentForm } from "./components/PaymentForm";
import { PaymentDialogHeader } from "./components/PaymentDialogHeader";

export * from "./types";
export { PaymentForm, PaymentDialogHeader };

export function PaymentDialog({
  open,
  onClose,
  conta,
  onSuccess,
}: PaymentDialogProps) {
  const {
    metodo,
    setMetodo,
    valor,
    setValor,
    pixKey,
    setPixKey,
    cardFields,
    updateCardField,
    resetForm,
    getPaymentData,
    remainingValue,
  } = usePaymentForm(conta);

  const { submit, loading } = usePaymentSubmission(
    (conta.id as string),
    metodo,
    getPaymentData,
    onSuccess,
    onClose,
    resetForm,
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <PaymentDialogHeader
          patientName={conta.patient_name}
          remainingValue={remainingValue}
        />

        <PaymentForm
          valor={valor}
          onValorChange={setValor}
          onCancel={onClose}
          onSubmit={submit}
          isLoading={loading}
        >
          <PaymentMethodTabs
            metodo={metodo}
            onMethodChange={setMetodo}
            pixKey={pixKey}
            onPixKeyChange={setPixKey}
            cardFields={cardFields}
            onCardFieldChange={updateCardField}
            onCardTypeChange={setMetodo}
          />
        </PaymentForm>
      </DialogContent>
    </Dialog>
  );
}
