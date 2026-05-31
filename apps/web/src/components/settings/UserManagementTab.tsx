import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/apiClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { UserFilters, UserForm, UserTable } from "./user-management";
import type { User, ModulePermission } from "./user-management";

export const UserManagementTab = () => {
  const { clinicId, hasRole, registerStaffUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modules, setModules] = useState<unknown[]>([]);

  // Form states
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"ADMIN" | "MEMBER" | "ROOT">(
    "MEMBER",
  );
  const [userPermissions, setUserPermissions] = useState<ModulePermission[]>(
    [],
  );

  useEffect(() => {
    if (hasRole("ADMIN")) {
      loadUsers();
      loadModules();
    }
  }, [hasRole, clinicId]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Buscar perfis da clínica
      const profiles = await apiClient.get<Record<string, any>[]>(
        "/configuracoes/usuarios",
      );

      // Buscar roles de cada usuário
      // Backend retorna profiles com roles já incluídos
      const usersWithRoles = (profiles || []).map(
        (profile: Record<string, unknown>) => ({
          id: String(profile.id),
          full_name: String(profile.full_name),
          role: String(profile.role || "MEMBER") as "ADMIN" | "MEMBER" | "ROOT",
          clinic_id: String(profile.clinic_id),
          created_at: String(profile.created_at),
        }),
      );

      setUsers(usersWithRoles);
    } catch (error: unknown) {
      toast.error("Erro ao carregar usuários");
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      const data = await apiClient.get<Record<string, any>[]>(
        "/configuracoes/modulos",
      );

      setModules(data || []);

      // Inicializar permissões
      const initialPermissions: ModulePermission[] = (data || []).map(
        (module: Record<string, unknown>) => ({
          module_key: String(module.module_key),
          module_name: String(module.name),
          can_view: false,
          can_edit: false,
          can_delete: false,
        }),
      );
      setUserPermissions(initialPermissions);
    } catch (error: unknown) {
      toast.error("Erro ao carregar módulos");
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserName || !newUserPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      // Criar usuário via AuthContext
      const { user: newUser, error } = await registerStaffUser({
        email: newUserEmail,
        password: newUserPassword,
        full_name: newUserName,
      });

      if (error || !newUser) {
        throw new Error("Usuário não criado");
      }

      // Atualizar perfil com clinic_id
      await apiClient.patch(`/configuracoes/usuarios/${newUser.id}`, {
        clinic_id: clinicId,
      });

      // Adicionar role
      await apiClient.post("/configuracoes/usuarios/roles", {
        user_id: newUser.id,
        role: newUserRole,
      });

      // Adicionar permissões de módulos se for MEMBER
      if (newUserRole === "MEMBER") {
        const permissionsToInsert = userPermissions
          .filter((p) => p.can_view || p.can_edit || p.can_delete)
          .map((p) => ({
            user_id: newUser.id,
            module_catalog_id: (modules as Record<string, unknown>[]).find(
              (m) => String(m.module_key) === p.module_key,
            )?.id,
            can_view: p.can_view,
            can_edit: p.can_edit,
            can_delete: p.can_delete,
          }))
          .filter((p) => p.module_catalog_id !== undefined);

        if (permissionsToInsert.length > 0) {
          await apiClient.post(
            "/configuracoes/permissoes",
            permissionsToInsert,
          );
        }
      }

      toast.success("Usuário criado com sucesso");
      setIsAddDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      console.error("Erro ao criar usuário:", error);
      toast.error(_e.message || "Erro ao criar usuário");
    }
  };

  const handleUpdateUserRole = async (
    userId: string,
    newRole: "ADMIN" | "MEMBER",
  ) => {
    try {
      await apiClient.patch(`/configuracoes/usuarios/${userId}/role`, {
        role: newRole,
      });

      toast.success("Role atualizada com sucesso");
      loadUsers();
    } catch (error: unknown) {
      console.error("Erro ao atualizar role:", error);
      toast.error("Erro ao atualizar role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;

    try {
      // Remover roles
      await apiClient.delete(`/configuracoes/usuarios/${userId}`);

      // Nota: A exclusão do perfil será automática devido ao trigger on delete cascade
      toast.success("Usuário removido com sucesso");
      loadUsers();
    } catch (error: unknown) {
      console.error("Erro ao remover usuário:", error);
      toast.error("Erro ao remover usuário");
    }
  };

  const resetForm = () => {
    setNewUserEmail("");
    setNewUserName("");
    setNewUserPassword("");
    setNewUserRole("MEMBER");
    setUserPermissions([]);
  };

  const updatePermission = (
    moduleKey: string,
    field: "can_view" | "can_edit" | "can_delete",
    value: boolean,
  ) => {
    setUserPermissions((prev) =>
      prev.map((perm) =>
        perm.module_key === moduleKey ? { ...perm, [field]: value } : perm,
      ),
    );
  };

  if (!hasRole("ADMIN")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
          <CardDescription>
            Apenas administradores podem acessar esta área.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <UserFilters>
        <UserForm
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          newUserEmail={newUserEmail}
          setNewUserEmail={setNewUserEmail}
          newUserName={newUserName}
          setNewUserName={setNewUserName}
          newUserPassword={newUserPassword}
          setNewUserPassword={setNewUserPassword}
          newUserRole={newUserRole}
          setNewUserRole={setNewUserRole}
          userPermissions={userPermissions}
          updatePermission={updatePermission}
          onSubmit={handleAddUser}
        />
      </UserFilters>

      <UserTable
        users={users}
        loading={loading}
        onUpdateRole={handleUpdateUserRole}
        onEdit={setSelectedUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};
