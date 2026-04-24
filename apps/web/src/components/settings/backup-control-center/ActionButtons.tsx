import { Button } from "@orthoplus/core-ui/button";
import { HardDrive, RefreshCw } from "lucide-react";

interface ActionButtonsProps {
  onBackup: () => void;
  onRestore: () => void;
}

export function ActionButtons({ onBackup, onRestore }: ActionButtonsProps) {
  return (
    <div className="flex gap-4">
      <Button size="lg" className="flex-1" onClick={onBackup}>
        <HardDrive className="mr-2 h-5 w-5" />
        Backup Agora
      </Button>
      <Button size="lg" variant="secondary" className="flex-1" onClick={onRestore}>
        <RefreshCw className="mr-2 h-5 w-5" />
        Restaurar
      </Button>
    </div>
  );
}
