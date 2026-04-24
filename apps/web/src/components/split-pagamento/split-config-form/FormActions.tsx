// cspell:disable
import { Button } from "@orthoplus/core-ui/button";

interface FormActionsProps {
  loading: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

export function FormActions({ loading, isEditing, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
        Cancelar
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
      </Button>
    </div>
  );
}
