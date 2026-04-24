import { Button } from "@orthoplus/core-ui/button";
import { Loader2 } from "lucide-react";

interface ActionButtonsProps {
  saving: boolean;
  onReset: () => void;
}

export function ActionButtons({ saving, onReset }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button type="submit" disabled={saving} className="flex-1">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar Configuração
      </Button>
      <Button type="button" variant="outline" onClick={onReset}>
        Limpar
      </Button>
    </div>
  );
}
