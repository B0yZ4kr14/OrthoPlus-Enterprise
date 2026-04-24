import { Label } from "@orthoplus/core-ui/label";
import { RadioGroup, RadioGroupItem } from "@orthoplus/core-ui/radio-group";
import { CheckCircle } from "lucide-react";
import type { BackupOption } from "./types";

interface BackupSelectProps {
  backups: BackupOption[];
  value: string;
  onChange: (value: string) => void;
}

export function BackupSelect({ backups, value, onChange }: BackupSelectProps) {
  return (
    <div className="space-y-4 py-4">
      <Label>Selecione o Backup</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        {backups.map((backup) => (
          <div
            key={backup.id}
            className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent"
          >
            <RadioGroupItem value={backup.id} id={backup.id} />
            <Label htmlFor={backup.id} className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{backup.date}</div>
                  <div className="text-sm text-muted-foreground">
                    {backup.type} • {backup.size}
                  </div>
                </div>
                {backup.status === "success" && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
