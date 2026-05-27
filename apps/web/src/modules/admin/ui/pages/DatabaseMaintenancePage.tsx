import { Database, Wrench, Play, TrendingUp, HardDrive } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { useDatabaseMaintenancePage } from "@/hooks/api/useDatabaseMaintenancePage";

interface DBStats {
  id?: string;
  clinicId?: string;
  connectionPoolSize?: number;
  activeConnections?: number;
  idleConnections?: number;
  slowQueriesCount?: number;
  averageQueryTime?: number;
  diskUsagePercent?: number;
  lastVacuum?: string;
  lastAnalyze?: string;
  timestamp?: string;
  tables?: Array<{
    name: string;
    rows: number;
    size: string;
    last_vacuum: string;
  }>;
}

export default function DatabaseMaintenancePage() {
  const { stats, isLoading: loading, executeMaintenance, isExecuting: executing } = useDatabaseMaintenancePage();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manutenção de Banco de Dados"
        description="Otimização, VACUUM, ANALYZE e monitoramento de performance"
        icon={Wrench}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tamanho do Banco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.diskUsagePercent ?? 0}% Utilizado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Médio de Query
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageQueryTime ? stats.averageQueryTime.toFixed(1) : 0}{" "}
              ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conexões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeConnections || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Queries Lentas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {stats?.slowQueriesCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Manutenção</CardTitle>
          <CardDescription>
            Execute operações de otimização e limpeza no banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">VACUUM</CardTitle>
                <CardDescription>
                  Recupera espaço em disco e desfragmenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => executeMaintenance({ operation: "VACUUM" })}
                  disabled={executing !== null}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {executing === "VACUUM" ? "Executando..." : "Executar VACUUM"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ANALYZE</CardTitle>
                <CardDescription>
                  Atualiza estatísticas do query planner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => executeMaintenance({ operation: "ANALYZE" })}
                  disabled={executing !== null}
                  className="w-full"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {executing === "ANALYZE"
                    ? "Executando..."
                    : "Executar ANALYZE"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">REINDEX</CardTitle>
                <CardDescription>
                  Reconstrói índices corrompidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => executeMaintenance({ operation: "REINDEX" })}
                  disabled={executing !== null}
                  className="w-full"
                >
                  <Database className="h-4 w-4 mr-2" />
                  {executing === "REINDEX"
                    ? "Executando..."
                    : "Executar REINDEX"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p>
              <strong>Último VACUUM:</strong>{" "}
              {stats?.lastVacuum
                ? new Date(stats.lastVacuum).toLocaleString()
                : "N/A"}
            </p>
            <p className="mt-1">
              <strong>Nota:</strong> Operações de manutenção podem afetar a
              performance durante execução.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tables Info */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Tabela</CardTitle>
          <CardDescription>Top 5 tabelas por tamanho</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.tables?.map((table) => (
              <div
                key={table.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{table.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {table.rows.toLocaleString()} rows • Último VACUUM:{" "}
                      {table.last_vacuum}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{table.size}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
