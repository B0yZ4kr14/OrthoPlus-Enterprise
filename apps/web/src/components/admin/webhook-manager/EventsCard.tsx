import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Webhook } from "lucide-react";
import type { GitHubEvent } from "./types";
import { EventList } from "./EventList";

interface EventsCardProps {
  events: GitHubEvent[];
  loading: boolean;
  onRefresh: () => void;
}

export function EventsCard({ events, loading, onRefresh }: EventsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              <CardTitle>Webhooks do GitHub</CardTitle>
            </div>
            <CardDescription>Eventos recebidos do repositório GitHub</CardDescription>
          </div>
          <Button onClick={onRefresh} disabled={loading}>
            {loading ? "Carregando..." : "Atualizar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Carregando eventos...</p>
        ) : (
          <EventList events={events} />
        )}
      </CardContent>
    </Card>
  );
}
