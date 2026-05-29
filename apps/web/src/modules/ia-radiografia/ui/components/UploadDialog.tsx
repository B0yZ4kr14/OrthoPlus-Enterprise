import { Button } from "@orthoplus/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { tipoRadiografiaLabels } from "@/modules/ia-radiografia/types/radiografia.types";
import { ShieldCheck, ShieldAlert, ShieldX, Loader2 } from "lucide-react";

export type ConsentStatus = "loading" | "consented" | "missing" | "revoked";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPatient: string;
  onPatientChange: (value: string) => void;
  selectedTipo: string;
  onTipoChange: (value: string) => void;
  selectedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  consentStatus?: ConsentStatus;
  onRegisterConsent?: () => void;
  checkingConsent?: boolean;
  isUploading?: boolean;
  uploadError?: string | null;
}

export function UploadDialog({
  open,
  onOpenChange,
  selectedPatient,
  onPatientChange,
  selectedTipo,
  onTipoChange,
  selectedFile,
  onFileChange,
  onUpload,
  consentStatus = "loading",
  onRegisterConsent,
  checkingConsent = false,
  isUploading = false,
  uploadError = null,
}: UploadDialogProps) {
  const canUpload =
    selectedFile &&
    selectedPatient &&
    selectedTipo &&
    consentStatus === "consented" &&
    !isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload de Radiografia</DialogTitle>
          <DialogDescription>
            Envie uma radiografia para análise automática com IA
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Paciente ID</Label>
            <Input
              placeholder="ID do paciente"
              value={selectedPatient}
              onChange={(e) => onPatientChange(e.target.value)}
            />
          </div>

          {/* Consent Status Banner */}
          {selectedPatient && (
            <div>
              {checkingConsent ? (
                <Alert className="bg-muted">
                  <AlertDescription>
                    Verificando consentimento LGPD...
                  </AlertDescription>
                </Alert>
              ) : consentStatus === "consented" ? (
                <Alert className="bg-success/10 border-success/30">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    Consentimento LGPD confirmado. Pode prosseguir com o upload.
                  </AlertDescription>
                </Alert>
              ) : consentStatus === "missing" ? (
                <Alert className="bg-destructive/10 border-destructive/30">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    Consentimento LGPD ausente. Registre o consentimento antes
                    de enviar.
                  </AlertDescription>
                  {onRegisterConsent && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={onRegisterConsent}
                    >
                      Registrar Consentimento
                    </Button>
                  )}
                </Alert>
              ) : consentStatus === "revoked" ? (
                <Alert className="bg-warning/10 border-warning/30">
                  <ShieldX className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-warning">
                    Consentimento foi revogado. Não é possível enviar
                    radiografias.
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
          )}

          <div>
            <Label>Tipo de Radiografia</Label>
            <Select value={selectedTipo} onValueChange={onTipoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tipoRadiografiaLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Arquivo de Imagem</Label>
            <Input type="file" accept="image/*" onChange={onFileChange} />
          </div>
          {uploadError && (
            <Alert className="bg-destructive/10 border-destructive/30">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {uploadError}
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={onUpload} disabled={!canUpload} className="w-full">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando e analisando...
              </>
            ) : (
              "Enviar e Analisar com IA"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
