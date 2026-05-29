// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { Card } from "@orthoplus/core-ui/card";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { ShieldCheck, TestTube, Loader2 } from "lucide-react";

interface TestSectionProps {
  testing: boolean;
  testAddress: string;
  hasXpub: boolean;
  onTest: () => void;
}

export function TestSection({
  testing,
  testAddress,
  hasXpub,
  onTest,
}: TestSectionProps) {
  return (
    <>
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertDescription>
          <strong>Verificação:</strong> Gere um endereço de teste para confirmar
          que a xPub está correta.
        </AlertDescription>
      </Alert>

      <Button
        type="button"
        onClick={onTest}
        variant="outline"
        disabled={testing || !hasXpub}
        className="w-full gap-2"
      >
        {testing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Testando...
          </>
        ) : (
          <>
            <TestTube className="h-4 w-4" />
            Testar xPub (Gerar Endereço #0)
          </>
        )}
      </Button>

      {testAddress && (
        <Card className="p-4 bg-muted">
          <p className="font-mono text-sm break-all">{testAddress}</p>
          <p className="text-xs text-muted-foreground mt-2">
            ✅ Confirme que este endereço bate com o da sua wallet (índice 0)
          </p>
        </Card>
      )}
    </>
  );
}
