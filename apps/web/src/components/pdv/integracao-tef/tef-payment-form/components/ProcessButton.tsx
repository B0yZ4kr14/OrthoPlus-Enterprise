import { Button } from "@orthoplus/core-ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface ProcessButtonProps {
  processando: boolean;
  onClick: () => void;
}

export function ProcessButton({ processando, onClick }: ProcessButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={processando}
      className="w-full"
      size="lg"
    >
      {processando ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando TEF...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Processar Pagamento
        </>
      )}
    </Button>
  );
}
