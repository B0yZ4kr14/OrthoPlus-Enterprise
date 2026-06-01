import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Calendar } from "@orthoplus/core-ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@orthoplus/core-ui/popover";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Shield,
  Calendar as CalendarIcon,
  User,
  Filter,
  Download,
  Search,
  FileText,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useAuditLogs } from "@/hooks/api/useAuditLogs";

export default function AuditLogs() {
  const { hasRole, clinicId } = useAuth();
  const {
    logs,
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedUser,
    setSelectedUser,
    selectedAction,
    setSelectedAction,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    handleClearFilters,
    exportLogs,
  } = useAuditLogs(clinicId ?? undefined, hasRole("ADMIN"));

  const getActionColor = (action: string) => {
    if (action.includes("DELETE") || action.includes("DEACTIVATE"))
      return "destructive";
    if (action.includes("CREATE") || action.includes("ACTIVATE"))
      return "default";
    if (action.includes("UPDATE") || action.includes("EDIT"))
      return "secondary";
    return "outline";
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      MODULE_ACTIVATED: "Módulo Ativado",
      MODULE_DEACTIVATED: "Módulo Desativado",
      USER_CREATED: "Usuário Criado",
      USER_UPDATED: "Usuário Atualizado",
      USER_DELETED: "Usuário Removido",
      BACKUP_MANUAL: "Backup Manual",
      BACKUP_CLEANUP: "Limpeza de Backups",
      BI_EXPORT_SCHEDULED: "Exportação BI Agendada",
      ODONTOGRAMA_UPDATED: "Odontograma Atualizado",
    };
    return labels[action] || action;
  };

  if (!hasRole("ADMIN")) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoria e Logs"
        icon={Shield}
        description="Histórico completo de acessos, alterações e ações no sistema"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total de Logs"
          value={logs.length}
          icon={FileText}
          variant="primary"
        />
        <StatsCard
          title="Ações de Criação"
          value={
            logs.filter(
              (l) =>
                l.action.includes("CREATE") || l.action.includes("ACTIVATE"),
            ).length
          }
          icon={PlusCircle}
          variant="success"
        />
        <StatsCard
          title="Ações de Deleção"
          value={
            logs.filter(
              (l) =>
                l.action.includes("DELETE") || l.action.includes("DEACTIVATE"),
            ).length
          }
          icon={Trash2}
          variant="danger"
        />
      </div>

      {/* Filtros */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
          <CardDescription>
            Refine sua pesquisa usando os filtros abaixo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar nos detalhes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Usuário</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Usuários</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || "Sem nome"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Tipo de Ação</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Ações</SelectItem>
                  <SelectItem value="MODULE_ACTIVATED">
                    Módulo Ativado
                  </SelectItem>
                  <SelectItem value="MODULE_DEACTIVATED">
                    Módulo Desativado
                  </SelectItem>
                  <SelectItem value="USER_CREATED">Usuário Criado</SelectItem>
                  <SelectItem value="USER_UPDATED">
                    Usuário Atualizado
                  </SelectItem>
                  <SelectItem value="USER_DELETED">Usuário Removido</SelectItem>
                  <SelectItem value="BACKUP_MANUAL">Backup Manual</SelectItem>
                  <SelectItem value="BI_EXPORT_SCHEDULED">
                    Exportação BI
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom
                        ? format(dateFrom, "dd/MM", { locale: ptBR })
                        : "De"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo
                        ? format(dateTo, "dd/MM", { locale: ptBR })
                        : "Até"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button"
              onClick={() => setSelectedUser(selectedUser)}
              className="flex-1"
            >
              <Search className="mr-2 h-4 w-4" />
              Aplicar Filtros
            </Button>
            <Button type="button" onClick={handleClearFilters} variant="outline">
              Limpar
            </Button>
            <Button type="button" onClick={exportLogs} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card variant="elevated" className="glass-card">
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
          <CardDescription>
            {logs.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum log encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const userName =
                  log.profiles?.full_name ||
                  users.find((u) => u.id === log.user_id)?.full_name ||
                  "Usuário desconhecido";
                return (
                  <Card key={log.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={getActionColor(log.action)}>
                                {getActionLabel(log.action)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                por {userName}
                              </span>
                            </div>
                            <p className="text-sm">
                              {format(
                                new Date(log.created_at),
                                "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                                { locale: ptBR },
                              )}
                            </p>
                            {log.details && (
                              <div className="mt-2 p-3 bg-muted rounded-md">
                                <pre className="text-xs overflow-x-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
