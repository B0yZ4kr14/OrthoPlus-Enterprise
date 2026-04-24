import { Card } from "@orthoplus/core-ui/card";

interface ActionLogProps {
  action: string | null;
}

export function ActionLog({ action }: ActionLogProps) {
  if (!action) return null;

  return (
    <Card className="p-4 bg-muted/50 border-dashed">
      <p className="text-sm font-mono">{action}</p>
    </Card>
  );
}
