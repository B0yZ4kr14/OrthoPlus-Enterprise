// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  isLoading: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

export function FormActions({
  isLoading,
  isEditing,
  onCancel,
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-4 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Atualizar" : "Criar"} Usuário
      </Button>
    </div>
  );
}
