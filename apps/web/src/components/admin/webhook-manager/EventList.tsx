import { Card } from "@orthoplus/core-ui/card";
import { Webhook } from "lucide-react";
import type { GitHubEvent } from "./types";
import { EventIcon } from "./EventIcon";
import { EventBadge } from "./EventBadge";
import { EventDataDisplay } from "./EventDataDisplay";

interface EventListProps {
  events: GitHubEvent[];
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum evento de webhook registrado</p>
        <p className="text-sm text-muted-foreground mt-2">
          Configure webhooks no repositório GitHub para receber notificações
          automáticas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className="p-4">
          <div className="flex items-start gap-3">
            <EventIcon eventType={event.event_type} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <EventBadge eventType={event.event_type} />
                <span className="text-sm text-muted-foreground">
                  {new Date(event.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
              <EventDataDisplay data={event.event_data} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
