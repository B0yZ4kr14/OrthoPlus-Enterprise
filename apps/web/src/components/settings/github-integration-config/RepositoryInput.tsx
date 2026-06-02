import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import { Button } from "@orthoplus/core-ui/button";
import { ExternalLink } from "lucide-react";

interface RepositoryInputProps {
  value: string;
  onChange: (value: string) => void;
  onTest: () => void;
}

export function RepositoryInput({
  value,
  onChange,
  onTest,
}: RepositoryInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="repo-url">URL do Repositório</Label>
      <div className="flex gap-2">
        <Input
          id="repo-url"
          placeholder="https://github.com/sua-organizacao/ortho-plus"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={onTest}
          title="Testar conexão"
          aria-label="Testar conexão com repositório"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Exemplo: https://github.com/sua-org/seu-repo
      </p>
    </div>
  );
}
