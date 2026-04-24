import { Button } from "@orthoplus/core-ui/button";
import { Loader2 } from "lucide-react";

interface ActionButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export function ActionButtons({ onCancel, onSubmit, loading }: ActionButtonsProps) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button variant="outline" onClick={onCancel} disabled={loading}>
        Cancelar
      </Button>
      <Button onClick={onSubmit} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Abrindo...
          </>
        ) : (
          "Abrir Caixa"
        )}
      </Button>
    </div>
  );
}
