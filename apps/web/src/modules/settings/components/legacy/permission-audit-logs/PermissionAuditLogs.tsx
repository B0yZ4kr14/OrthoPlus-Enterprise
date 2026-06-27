// cspell:disable
import { useAuditLogs } from "./useAuditLogs";
import { LoadingState } from "./LoadingState";
import { FilterControls } from "./FilterControls";
import { LogsList } from "./LogsList";

export function PermissionAuditLogs() {
  const {
    loading,
    filteredLogs,
    filterUser,
    setFilterUser,
    filterAction,
    setFilterAction,
    uniqueUsers,
  } = useAuditLogs();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Auditoria de Permissões</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Histórico completo de todas as alterações de permissões de acesso
        </p>
      </div>

      <FilterControls
        filterUser={filterUser}
        filterAction={filterAction}
        uniqueUsers={uniqueUsers}
        onUserChange={setFilterUser}
        onActionChange={setFilterAction}
      />

      <LogsList logs={filteredLogs} />
    </div>
  );
}
