import { Button } from "@orthoplus/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { UserPlus, Shield, Settings } from "lucide-react";
import type { ModulePermission } from "./types";
import { PermissionModal } from "./PermissionModal";

interface UserFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newUserEmail: string;
  setNewUserEmail: (value: string) => void;
  newUserName: string;
  setNewUserName: (value: string) => void;
  newUserPassword: string;
  setNewUserPassword: (value: string) => void;
  newUserRole: "ADMIN" | "MEMBER" | "ROOT";
  setNewUserRole: (value: "ADMIN" | "MEMBER" | "ROOT") => void;
  userPermissions: ModulePermission[];
  updatePermission: (
    moduleKey: string,
    field: "can_view" | "can_edit" | "can_delete",
    value: boolean,
  ) => void;
  onSubmit: () => void;
}

export function UserForm({
  isOpen,
  onOpenChange,
  newUserEmail,
  setNewUserEmail,
  newUserName,
  setNewUserName,
  newUserPassword,
  setNewUserPassword,
  newUserRole,
  setNewUserRole,
  userPermissions,
  updatePermission,
  onSubmit,
}: UserFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário e configure suas permissões
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="João Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="joao@clinica.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha Temporária</Label>
              <Input
                id="password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Nível de Acesso</Label>
              <Select
                value={newUserRole}
                onValueChange={(value: "ADMIN" | "MEMBER") =>
                  setNewUserRole(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Membro (Acesso Limitado)
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrador (Acesso Total)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configure as permissões granulares por módulo (disponível apenas
              para MEMBER)
            </p>

            <PermissionModal
              role={newUserRole}
              permissions={userPermissions}
              onPermissionChange={updatePermission}
            />
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-4">
          <Button type="button" onClick={onSubmit} className="flex-1">
            Criar Usuário
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
