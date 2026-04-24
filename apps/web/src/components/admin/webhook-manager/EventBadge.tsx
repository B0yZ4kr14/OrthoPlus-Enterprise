import { Badge } from "@orthoplus/core-ui/badge";

interface EventBadgeProps {
  eventType: string;
}

export function EventBadge({ eventType }: EventBadgeProps) {
  const getVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (eventType.includes("push")) return "default";
    if (eventType.includes("pull_request")) return "secondary";
    if (eventType.includes("error")) return "destructive";
    return "outline";
  };

  return <Badge variant={getVariant()}>{eventType}</Badge>;
}
