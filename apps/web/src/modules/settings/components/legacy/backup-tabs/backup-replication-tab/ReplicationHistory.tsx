import { Card } from "@orthoplus/core-ui/card";
import { Globe } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { ReplicationRecord } from "./types";

interface ReplicationHistoryProps {
  replications: ReplicationRecord[];
}

export function ReplicationHistory({ replications }: ReplicationHistoryProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Histórico de Replicações</h3>
      <div className="space-y-3">
        {replications?.slice(0, 10).map((replication) => (
          <div
            key={replication.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{replication.region}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(replication.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
            <StatusBadge status={replication.replication_status} />
          </div>
        ))}
      </div>
    </Card>
  );
}
