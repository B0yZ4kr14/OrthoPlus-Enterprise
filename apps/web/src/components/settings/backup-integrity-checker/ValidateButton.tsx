import { Button } from "@orthoplus/core-ui/button";
import { Loader2, Shield } from "lucide-react";

interface ValidateButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

export function ValidateButton({
  disabled,
  loading,
  onClick,
}: ValidateButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled || loading} className="w-full">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Validando...
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" />
          Validar Integridade
        </>
      )}
    </Button>
  );
}
