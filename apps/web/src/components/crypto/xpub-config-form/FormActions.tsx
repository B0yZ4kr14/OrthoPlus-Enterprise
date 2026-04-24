// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { Save } from "lucide-react";

interface FormActionsProps {
  isValid: boolean;
  onCancel?: () => void;
}

export function FormActions({ isValid, onCancel }: FormActionsProps) {
  return (
    <div className="flex gap-3">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      )}
      <Button type="submit" disabled={!isValid} className="flex-1 gap-2">
        <Save className="h-4 w-4" />
        Salvar Configuração
      </Button>
    </div>
  );
}
