import { useWebhookEvents } from "./useWebhookEvents";
import { EventsCard } from "./EventsCard";
import { ConfigCard } from "./ConfigCard";

export function WebhookManager() {
  const { events, loading, refetch } = useWebhookEvents();

  return (
    <div className="space-y-6">
      <EventsCard events={events} loading={loading} onRefresh={refetch} />
      <ConfigCard />
    </div>
  );
}
