// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  loading: boolean;
  isEditing: boolean;
  onCancel?: () => void;
}

export function FormActions({
  loading,
  isEditing,
  onCancel,
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : isEditing ? (
          "Atualizar"
        ) : (
          "Criar"
        )}
      </Button>
    </div>
  );
}
