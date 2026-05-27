import { CardHeader, CardTitle, CardDescription } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Bitcoin, RefreshCw } from "lucide-react";

interface WidgetHeaderProps {
  lastUpdate: Date | null;
  loading: boolean;
  onRefresh: () => void;
}

export function WidgetHeader({ lastUpdate, loading, onRefresh }: WidgetHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-warning" />
            Crypto Rates
          </CardTitle>
          <CardDescription>
            Cotações em tempo real
            {lastUpdate && (
              <span className="ml-2 text-xs">• Atualizado {lastUpdate.toLocaleTimeString()}</span>
            )}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </CardHeader>
  );
}
