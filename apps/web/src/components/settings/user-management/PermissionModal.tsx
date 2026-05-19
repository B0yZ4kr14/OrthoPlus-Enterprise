import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card"
import { Label } from "@orthoplus/core-ui/label"
import { Switch } from "@orthoplus/core-ui/switch"
import type { ModulePermission } from "./types"

interface PermissionModalProps {
  role: "ADMIN" | "MEMBER" | "ROOT"
  permissions: ModulePermission[]
  onPermissionChange: (
    moduleKey: string,
    field: "can_view" | "can_edit" | "can_delete",
    value: boolean,
  ) => void
}

export function PermissionModal({
  role,
  permissions,
  onPermissionChange,
}: PermissionModalProps) {
  if (role === "ADMIN") {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm">
          Administradores têm acesso total a todos os módulos automaticamente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {permissions.map((perm) => (
        <Card key={perm.module_key}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{perm.module_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor={`${perm.module_key}-view`}
                className="text-sm"
              >
                Visualizar
              </Label>
              <Switch
                id={`${perm.module_key}-view`}
                checked={perm.can_view}
                onCheckedChange={(checked) =>
                  onPermissionChange(perm.module_key, "can_view", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label
                htmlFor={`${perm.module_key}-edit`}
                className="text-sm"
              >
                Editar
              </Label>
              <Switch
                id={`${perm.module_key}-edit`}
                checked={perm.can_edit}
                onCheckedChange={(checked) =>
                  onPermissionChange(perm.module_key, "can_edit", checked)
                }
                disabled={!perm.can_view}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label
                htmlFor={`${perm.module_key}-delete`}
                className="text-sm"
              >
                Excluir
              </Label>
              <Switch
                id={`${perm.module_key}-delete`}
                checked={perm.can_delete}
                onCheckedChange={(checked) =>
                  onPermissionChange(perm.module_key, "can_delete", checked)
                }
                disabled={!perm.can_view}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
