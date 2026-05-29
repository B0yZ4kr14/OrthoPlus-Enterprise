// cspell:disable
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Loader2 } from "lucide-react";
import { useAnalytics } from "./useAnalytics";
import { KPICards } from "./KPICards";
import { Charts } from "./Charts";

export function OnboardingAnalyticsDashboard() {
  const { analytics, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Nenhum dado de analytics disponível
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <KPICards analytics={analytics} />
      <Charts analytics={analytics} />
    </div>
  );
}
