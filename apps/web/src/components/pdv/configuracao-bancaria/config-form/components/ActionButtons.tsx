import { Button } from "@orthoplus/core-ui/button";
import { Loader2 } from "lucide-react";

interface ActionButtonsProps {
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function ActionButtons({
  loading,
  onSave,
  onCancel,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2 mt-4">
      <Button onClick={onSave} disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Salvar
      </Button>
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}
