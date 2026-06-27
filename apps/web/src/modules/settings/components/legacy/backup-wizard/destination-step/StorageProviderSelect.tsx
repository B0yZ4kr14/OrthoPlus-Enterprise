import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { ScheduledBackupConfig } from "../types";
import { STORAGE_OPTIONS } from "./types";

interface StorageProviderSelectProps {
  value: ScheduledBackupConfig["cloudStorageProvider"];
  onChange: (value: ScheduledBackupConfig["cloudStorageProvider"]) => void;
}

export function StorageProviderSelect({
  value,
  onChange,
}: StorageProviderSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Onde deseja armazenar o backup?</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STORAGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
