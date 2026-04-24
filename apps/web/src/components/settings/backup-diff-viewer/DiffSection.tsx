// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Plus, Minus, Edit } from "lucide-react";
import { ScrollArea } from "@orthoplus/core-ui/scroll-area";
import type { DiffResult } from "./types";

interface DiffSectionProps {
  title: string;
  diff: DiffResult;
}

export function DiffSection({ title, diff }: DiffSectionProps) {
  const total = diff.added.length + diff.modified.length + diff.removed.length;

  if (total === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground" depth="subtle">
        Nenhuma alteração em {title}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="outline">{total} alterações</Badge>
      </div>

      {diff.added.length > 0 && (
        <Card className="p-4 border-success" depth="normal">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-success" />
            <span className="font-medium text-success">
              {diff.added.length} Adicionado{diff.added.length > 1 ? "s" : ""}
            </span>
          </div>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {diff.added.map((item, idx) => (
                <div key={idx} className="p-2 bg-success/10 rounded text-sm font-mono">
                  {JSON.stringify(item, null, 2)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {diff.modified.length > 0 && (
        <Card className="p-4 border-warning" depth="normal">
          <div className="flex items-center gap-2 mb-3">
            <Edit className="h-4 w-4 text-warning" />
            <span className="font-medium text-warning">
              {diff.modified.length} Modificado{diff.modified.length > 1 ? "s" : ""}
            </span>
          </div>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {diff.modified.map((item, idx) => (
                <div key={idx} className="p-2 bg-warning/10 rounded text-sm font-mono">
                  {JSON.stringify(item, null, 2)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {diff.removed.length > 0 && (
        <Card className="p-4 border-destructive" depth="normal">
          <div className="flex items-center gap-2 mb-3">
            <Minus className="h-4 w-4 text-destructive" />
            <span className="font-medium text-destructive">
              {diff.removed.length} Removido{diff.removed.length > 1 ? "s" : ""}
            </span>
          </div>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {diff.removed.map((item, idx) => (
                <div key={idx} className="p-2 bg-destructive/10 rounded text-sm font-mono">
                  {JSON.stringify(item, null, 2)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
