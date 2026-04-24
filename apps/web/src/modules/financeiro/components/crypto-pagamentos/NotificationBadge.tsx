// cspell:disable
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";

interface NotificationBadgeProps {
  connected: boolean;
  onRequestPermission: () => void;
}

export function NotificationBadge({ connected, onRequestPermission }: NotificationBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <Badge variant={connected ? "success" : "secondary"} className="gap-2">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-success" : "bg-muted-foreground"}`} />
        {connected ? "Notificações em Tempo Real Ativas" : "Notificações Desconectadas"}
      </Badge>
      {!connected && (
        <Button variant="outline" size="sm" onClick={onRequestPermission}>
          Ativar Notificações Push
        </Button>
      )}
    </div>
  );
}
