import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import { Switch } from "@orthoplus/core-ui/switch";
import { Label } from "@orthoplus/core-ui/label";
import type { User, ModulePermission } from "./types";

interface PermissionsDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  permissions: ModulePermission[];
  onPermissionsChange: (perms: ModulePermission[]) => void;
  onSave: () => void;
}

export function PermissionsDialog({
  user,
  isOpen,
  onClose,
  permissions,
  onPermissionsChange,
  onSave,
}: PermissionsDialogProps) {
  const togglePermission = (index: number, field: keyof ModulePermission) => {
    const newPerms = [...permissions];
    newPerms[index] = { ...newPerms[index], [field]: !newPerms[index][field] };
    onPermissionsChange(newPerms);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Permissões de {user?.full_name || "Usuário"}
          </DialogTitle>
          <DialogDescription>
            Gerencie as permissões de acesso aos módulos
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {permissions.map((perm, index) => (
            <div
              key={perm.module_key}
              className="flex items-center justify-between p-3 border rounded"
            >
              <span className="font-medium">{perm.module_name}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={perm.can_view}
                    onCheckedChange={() => togglePermission(index, "can_view")}
                  />
                  <Label className="text-sm">Ver</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={perm.can_edit}
                    onCheckedChange={() => togglePermission(index, "can_edit")}
                  />
                  <Label className="text-sm">Editar</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={perm.can_delete}
                    onCheckedChange={() =>
                      togglePermission(index, "can_delete")
                    }
                  />
                  <Label className="text-sm">Excluir</Label>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={onSave}>Salvar Permissões</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
