import {Database, Play, Archive, Clock} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Skeleton } from "@orthoplus/core-ui/skeleton";
import { useBackupStatus } from "../../../hooks/useBackupStatus";

export function CategoryBackupPanel() {
  const { categories, isLoading, executeBackup, isExecuting } =
    useBackupStatus();

  const getStatusBadge = (lastBackup: string | null) => {
    if (!lastBackup) {
      return <Badge variant="outline">Nunca</Badge>;
    }
    const daysSince = Math.floor(
      (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSince === 0) return <Badge variant="success">Hoje</Badge>;
    if (daysSince <= 7) return <Badge variant="warning">{daysSince}d</Badge>;
    return <Badge variant="destructive">{daysSince}d</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Backups por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))
          : categories.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{cat.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {cat.schemas.join(", ")}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {cat.lastBackup
                          ? new Date(cat.lastBackup).toLocaleString("pt-BR")
                          : "Nenhum backup"}
                      </span>
                      {getStatusBadge(cat.lastBackup)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {cat.lastBackupSizeHuman}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cat.backupCount} backups
                    </p>
                  </div>
                  <Button type="button"
                    size="sm"
                    onClick={() => executeBackup(cat.category)}
                    disabled={isExecuting}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {isExecuting ? "..." : "Backup"}
                  </Button>
                </div>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
