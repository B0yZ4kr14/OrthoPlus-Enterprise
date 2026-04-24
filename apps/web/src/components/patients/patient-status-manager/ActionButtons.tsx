import { Button } from "@orthoplus/core-ui/button";

interface ActionButtonsProps {
  isSubmitting: boolean;
  canConfirm: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ActionButtons({
  isSubmitting,
  canConfirm,
  onConfirm,
  onCancel,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onConfirm} disabled={isSubmitting || !canConfirm} className="flex-1">
        {isSubmitting ? "Salvando..." : "Confirmar Mudança"}
      </Button>
      <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
        Cancelar
      </Button>
    </div>
  );
}
