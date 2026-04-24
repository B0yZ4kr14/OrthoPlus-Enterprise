import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Button } from "@orthoplus/core-ui/button";
import { Lock, Loader2, AlertTriangle } from "lucide-react";

interface BackupValidationProps {
  requiresDecryption: boolean;
  decryptionPassword: string;
  onPasswordChange: (password: string) => void;
  onDecrypt: () => void;
  loading: boolean;
  error: string | null;
}

export function BackupValidation({
  requiresDecryption,
  decryptionPassword,
  onPasswordChange,
  onDecrypt,
  loading,
  error,
}: BackupValidationProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!requiresDecryption) {
    return (
      <div className="text-center py-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p>Validando arquivo de backup...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Este backup está criptografado. Digite a senha de descriptografia.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="password">Senha de Descriptografia</Label>
        <Input
          id="password"
          type="password"
          value={decryptionPassword}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Digite a senha"
        />
      </div>

      <Button
        onClick={onDecrypt}
        disabled={!decryptionPassword || loading}
        className="w-full"
      >
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Descriptografar
      </Button>
    </div>
  );
}
