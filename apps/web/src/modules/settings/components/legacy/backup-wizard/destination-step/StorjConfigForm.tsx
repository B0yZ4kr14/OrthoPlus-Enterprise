import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import type { ScheduledBackupConfig } from "../types";

interface StorjConfigFormProps {
  config: ScheduledBackupConfig["storjConfig"];
  onChange: (config: ScheduledBackupConfig["storjConfig"]) => void;
}

export function StorjConfigForm({ config, onChange }: StorjConfigFormProps) {
  const updateField = (
    field: keyof NonNullable<typeof config>,
    value: string,
  ) => {
    onChange({
      ...config,
      [field]: value,
    } as ScheduledBackupConfig["storjConfig"]);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="storj-access-grant">Access Grant</Label>
        <Input
          id="storj-access-grant"
          placeholder="Seu access grant do Storj DCS"
          value={config?.accessGrant || ""}
          onChange={(e) => updateField("accessGrant", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Obtenha seu access grant em:{" "}
          <a
            href="https://storj.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            storj.io
          </a>
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="storj-bucket">Bucket</Label>
        <Input
          id="storj-bucket"
          placeholder="orthoplus-backups"
          value={config?.bucket || ""}
          onChange={(e) => updateField("bucket", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="storj-prefix">Prefixo (opcional)</Label>
        <Input
          id="storj-prefix"
          placeholder="clinic-name/"
          value={config?.prefix || ""}
          onChange={(e) => updateField("prefix", e.target.value)}
        />
      </div>
    </div>
  );
}
