// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { Plus } from "lucide-react";

interface HeaderProps {
  onNewConfig: () => void;
}

export function Header({ onNewConfig }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Configuração Bancária</h2>
        <p className="text-muted-foreground">Configure integração com APIs bancárias para conciliação automática</p>
      </div>
      <Button onClick={onNewConfig}>
        <Plus className="h-4 w-4 mr-2" />
        Nova Configuração
      </Button>
    </div>
  );
}
