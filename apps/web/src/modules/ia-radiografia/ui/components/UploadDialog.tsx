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
import { tipoRadiografiaLabels } from "@/modules/ia-radiografia/types/radiografia.types";

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
}: UploadDialogProps) {
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
          <Button
            onClick={onUpload}
            disabled={!selectedFile || !selectedPatient || !selectedTipo}
            className="w-full"
          >
            Enviar e Analisar com IA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
