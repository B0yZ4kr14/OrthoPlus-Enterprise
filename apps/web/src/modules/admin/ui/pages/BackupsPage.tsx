import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Database,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  HardDrive,
} from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";

interface Backup {
  id: string;
  backup_type: string;
  status: string;
  file_size_bytes: number;
  created_at: string;
  completed_at: string | null;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Backup[]>("/backups");
      setBackups(response);
    } catch (error) {
      console.error("Error fetching backups:", error);
      toast.error("Erro ao carregar backups");
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setCreating(true);
      await apiClient.post("/backups/create", { backup_type: "full" });
      toast.success("Backup iniciado com sucesso");
      fetchBackups();
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Erro ao criar backup");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb > 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Concluído",
      },
      in_progress: {
        variant: "secondary" as const,
        icon: Loader2,
        label: "Em Progresso",
      },
      failed: {
        variant: "destructive" as const,
        icon: AlertCircle,
        label: "Falhou",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.completed;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={HardDrive} 
        title="Backups" 
        description="Central de backups e restauração de dados" 
        actions={
          <Button onClick={createBackup} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Criar Backup
              </>
            )}
          </Button>
        } 
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total de Backups"
          value={backups.length}
          icon={Database}
          variant="primary"
        />
        <StatsCard
          title="Último Backup"
          value={
            backups[0]
              ? new Date(backups[0].created_at).toLocaleDateString("pt-BR")
              : "N/A"
          }
          icon={Clock}
          variant="default"
        />
        <StatsCard
          title="Espaço Utilizado"
          value={formatFileSize(
            backups.reduce((acc, b) => acc + (b.file_size_bytes || 0), 0),
          )}
          icon={Upload}
          variant="success"
        />
      </div>

      <Card variant="elevated" className="glass-card">
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
          <CardDescription>
            Lista de todos os backups realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum backup encontrado. Crie o primeiro backup agora.
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        Backup {backup.backup_type}
                      </span>
                      {getStatusBadge(backup.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Criado em{" "}
                      {new Date(backup.created_at).toLocaleString("pt-BR")}
                    </div>
                    {backup.file_size_bytes && (
                      <div className="text-sm text-muted-foreground">
                        Tamanho: {formatFileSize(backup.file_size_bytes)}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
