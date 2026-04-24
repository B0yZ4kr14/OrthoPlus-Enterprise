import type { BackupEntry } from "./types";

interface BackupSelectProps {
  backups: BackupEntry[];
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
}

export function BackupSelect({ backups, value, onChange, onFocus }: BackupSelectProps) {
  return (
    <div>
      <label htmlFor="backup-select" className="text-sm font-medium mb-2 block">
        Selecione um Backup para Validar
      </label>
      <select
        id="backup-select"
        className="w-full p-2 border rounded bg-background"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        aria-label="Selecionar backup para validação"
      >
        <option value="">Selecione...</option>
        {backups.map((b) => (
          <option key={b.id} value={b.id}>
            {new Date(b.created_at).toLocaleString()} - {b.backup_type}
          </option>
        ))}
      </select>
    </div>
  );
}
