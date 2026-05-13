// cspell:disable
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";

interface NotificationBadgeProps {
  connected?: boolean;
  onRequestPermission?: () => void;
  count?: number;
}

export function NotificationBadge({ connected, onRequestPermission, count }: NotificationBadgeProps) {
  if (count !== undefined) {
    return (
      <Badge variant={count > 0 ? "warning" : "secondary"} className="gap-2">
        {count} pendentes
      </Badge>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Badge variant={connected ? "success" : "secondary"} className="gap-2">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-success" : "bg-muted-foreground"}`} />
        {connected ? "Notificações em Tempo Real Ativas" : "Notificações Desconectadas"}
      </Badge>
      {!connected && onRequestPermission && (
        <Button variant="outline" size="sm" onClick={onRequestPermission}>
          Ativar Notificações Push
        </Button>
      )}
    </div>
  );
}
