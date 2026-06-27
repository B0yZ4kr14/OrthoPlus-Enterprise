// cspell:disable
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@orthoplus/core-ui/dialog";
import { Progress } from "@orthoplus/core-ui/progress";

interface WizardHeaderProps {
  isEditing: boolean;
  progress: number;
}

export function WizardHeader({ isEditing, progress }: WizardHeaderProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Backup Agendado" : "Configurar Backup Agendado"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Altere as configurações do backup automático"
            : "Configure backups automáticos para sua clínica"}
        </DialogDescription>
      </DialogHeader>
      <Progress value={progress} className="mb-4" />
    </>
  );
}
