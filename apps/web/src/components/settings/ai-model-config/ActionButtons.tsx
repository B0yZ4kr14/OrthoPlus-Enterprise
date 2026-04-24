// cspell:disable
import { RefreshCw } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";

interface ActionButtonsProps {
  saving: boolean;
  onSave: () => void;
  onReload: () => void;
}

export function ActionButtons({ saving, onSave, onReload }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar Configurações"}
      </Button>
      <Button variant="outline" onClick={onReload}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Recarregar
      </Button>
    </div>
  );
}
