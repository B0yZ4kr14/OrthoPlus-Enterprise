import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";

interface PaymentDialogHeaderProps {
  patientName: string;
  remainingValue: number;
}

export function PaymentDialogHeader({
  patientName,
  remainingValue,
}: PaymentDialogHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle>Processar Pagamento</DialogTitle>
      <DialogDescription>
        Paciente: {patientName} | Valor restante: R$ {remainingValue.toFixed(2)}
      </DialogDescription>
    </DialogHeader>
  );
}
