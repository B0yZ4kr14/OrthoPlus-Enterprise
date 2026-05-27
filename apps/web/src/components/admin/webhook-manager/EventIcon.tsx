import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";

interface EventIconProps {
  eventType: string;
}

export function EventIcon({ eventType }: EventIconProps) {
  if (eventType.includes("push"))
    return <Activity className="h-4 w-4 text-info" />;
  if (eventType.includes("pull_request"))
    return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (eventType.includes("error"))
    return <XCircle className="h-4 w-4 text-destructive" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
}
