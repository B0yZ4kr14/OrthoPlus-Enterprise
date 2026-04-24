import { Button } from "@orthoplus/core-ui/button";
import { Plus } from "lucide-react";

interface AddWalletButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function AddWalletButton({ disabled, onClick }: AddWalletButtonProps) {
  return (
    <Button onClick={onClick} className="w-full" disabled={disabled}>
      <Plus className="h-4 w-4 mr-2" />
      Adicionar Carteira Offline
    </Button>
  );
}
