import { Button } from "@orthoplus/core-ui/button";
import { RefreshCw, Check } from "lucide-react";

interface ActionButtonsProps {
  testingConnection: boolean;
  isAutenticando: boolean;
  isTokenValid: boolean;
  onTestConnection: () => void;
}

export function ActionButtons({
  testingConnection,
  isAutenticando,
  isTokenValid,
  onTestConnection,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onTestConnection}
        disabled={testingConnection || !isTokenValid}
      >
        {testingConnection ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Testando...
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            Testar Conexão
          </>
        )}
      </Button>
      <Button type="submit" disabled={isAutenticando}>
        {isAutenticando ? "Conectando..." : "Conectar Repositório"}
      </Button>
    </div>
  );
}
