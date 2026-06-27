// cspell:disable
import { usePermissionTemplates } from "./usePermissionTemplates";
import { LoadingState } from "./LoadingState";
import { UserSelect } from "./UserSelect";
import { TemplateCard } from "./TemplateCard";

export function PermissionTemplates() {
  const {
    templates,
    users,
    selectedUser,
    setSelectedUser,
    applying,
    loading,
    applyTemplate,
  } = usePermissionTemplates();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Templates de Permissões</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Aplique rapidamente conjuntos pré-definidos de permissões aos usuários
        </p>

        <UserSelect
          value={selectedUser}
          users={users}
          onChange={setSelectedUser}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selectedUser={selectedUser}
            isApplying={applying === template.id}
            onApply={() => applyTemplate(template.id, template)}
          />
        ))}
      </div>
    </div>
  );
}
