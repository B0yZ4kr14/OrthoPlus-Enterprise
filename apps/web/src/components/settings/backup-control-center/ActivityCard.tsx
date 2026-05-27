import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { BackupActivity } from "./types";

interface ActivityCardProps {
  activities: BackupActivity[];
}

export function ActivityCard({ activities }: ActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((backup, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                {backup.status === "success" ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {backup.date} - {backup.type}
                  </p>
                  <p className="text-xs text-muted-foreground">{backup.size}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Ver Detalhes
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
