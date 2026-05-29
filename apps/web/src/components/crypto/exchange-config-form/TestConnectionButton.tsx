// cspell:disable
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";

interface TestConnectionButtonProps {
  onClick: () => void;
  isTesting: boolean;
}

export function TestConnectionButton({
  onClick,
  isTesting,
}: TestConnectionButtonProps) {
  return (
    <div className="flex justify-end">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={isTesting}
      >
        {isTesting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Testando Conexão...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Testar Conexão
          </>
        )}
      </Button>
    </div>
  );
}
