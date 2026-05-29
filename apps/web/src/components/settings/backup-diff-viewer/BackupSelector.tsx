// cspell:disable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { formatDateTime } from "@/lib/utils/date.utils";

interface BackupSelectorProps {
  label: string;
  value: string;
  backups: Record<string, any>[] | undefined;
  onChange: (value: string) => void;
}

export function BackupSelector({
  label,
  value,
  backups,
  onChange,
}: BackupSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Selecione o ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {backups?.map((backup) => (
            <SelectItem key={backup.id} value={backup.id}>
              {formatDateTime(backup.created_at)} - {backup.backup_type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
