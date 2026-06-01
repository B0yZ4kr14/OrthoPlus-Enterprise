import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface NotificationEmailsInputProps {
  emails: string[];
  onChange: (emails: string[]) => void;
}

export function NotificationEmailsInput({
  emails,
  onChange,
}: NotificationEmailsInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="backup-emails">E-mails para Notificação (opcional)</Label>
      <Input
        id="backup-emails"
        placeholder="admin@example.com, backup@example.com"
        value={emails.join(", ")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((em) => em.trim())
              .filter(Boolean),
          )
        }
      />
      <p className="text-xs text-muted-foreground">
        Separe múltiplos e-mails com vírgula
      </p>
    </div>
  );
}
