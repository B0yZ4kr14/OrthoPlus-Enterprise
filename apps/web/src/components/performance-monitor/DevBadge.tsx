import { Badge } from "@orthoplus/core-ui/badge";
import { Activity } from "lucide-react";

export function DevBadge() {
  return (
    <div className="text-center">
      <Badge variant="secondary" className="text-xs">
        <Activity className="h-3 w-3 mr-1" />
        DEV MODE
      </Badge>
    </div>
  );
}
