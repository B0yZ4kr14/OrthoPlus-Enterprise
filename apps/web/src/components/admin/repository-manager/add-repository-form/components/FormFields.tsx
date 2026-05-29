import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Switch } from "@orthoplus/core-ui/switch";
import type { RepositoryFormData } from "../types";

interface FormFieldsProps {
  formData: RepositoryFormData;
  onChange: <K extends keyof RepositoryFormData>(
    field: K,
    value: RepositoryFormData[K],
  ) => void;
}

export function FormFields({ formData, onChange }: FormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="repo-name">Nome do Repositório</Label>
          <Input
            id="repo-name"
            placeholder="ortho-plus"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="repo-url">URL do Repositório</Label>
          <Input
            id="repo-url"
            placeholder="https://github.com/org/repo"
            value={formData.url}
            onChange={(e) => onChange("url", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="repo-token">
          Token de Acesso (Personal Access Token)
        </Label>
        <Input
          id="repo-token"
          type="password"
          placeholder="ghp_xxxxxxxxxxxx"
          value={formData.token}
          onChange={(e) => onChange("token", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Crie um token em GitHub → Settings → Developer settings → Personal
          access tokens
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="default-branch">Branch Padrão</Label>
        <Select
          value={formData.defaultBranch}
          onValueChange={(value) => onChange("defaultBranch", value)}
        >
          <SelectTrigger id="default-branch">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">main</SelectItem>
            <SelectItem value="master">master</SelectItem>
            <SelectItem value="develop">develop</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enable-webhooks"
          checked={formData.enableWebhooks}
          onCheckedChange={(checked) => onChange("enableWebhooks", checked)}
        />
        <Label htmlFor="enable-webhooks">
          Habilitar Webhooks (notificações automáticas)
        </Label>
      </div>
    </>
  );
}
