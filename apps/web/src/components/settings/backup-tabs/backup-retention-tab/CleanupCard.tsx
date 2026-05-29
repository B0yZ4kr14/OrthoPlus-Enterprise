import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Trash2 } from "lucide-react";

interface CleanupCardProps {
  onCleanup: () => void;
  isPending: boolean;
}

export function CleanupCard({ onCleanup, isPending }: CleanupCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Limpeza Manual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Execute a limpeza manual de backups antigos baseado nas configurações
          atuais.
        </p>
        <Button variant="destructive" onClick={onCleanup} disabled={isPending}>
          Executar Limpeza Agora
        </Button>
      </CardContent>
    </Card>
  );
}
