import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { apiClient } from "@/lib/api/apiClient";
import type { User, ModulePermission, NewUserFormData } from "./types";

interface UseUserManagementReturn {
  users: User[];
  loading: boolean;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  modules: unknown[];
  userPermissions: ModulePermission[];
  setUserPermissions: (perms: ModulePermission[]) => void;
  loadUsers: () => Promise<void>;
  handleAddUser: (formData: NewUserFormData) => Promise<void>;
  handleDeleteUser: (userId: string) => Promise<void>;
  handleUpdatePermissions: () => Promise<void>;
}

export function useUserManagement(clinicId: string | null): UseUserManagementReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modules, setModules] = useState<unknown[]>([]);
  const [userPermissions, setUserPermissions] = useState<ModulePermission[]>([]);

  const loadUsers = useCallback(async () => {
    if (!clinicId) return;
    try {
      setLoading(true);
      const response = await apiClient.get<User[]>(`/clinics/${clinicId}/users`);
      setUsers(response);
    } catch (error) {
      logger.error("Error loading users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  const handleAddUser = async (formData: NewUserFormData) => {
    if (!clinicId) return;
    try {
      await apiClient.post(`/clinics/${clinicId}/users`, formData);
      toast.success("Usuário adicionado com sucesso");
      setIsAddDialogOpen(false);
      loadUsers();
    } catch (error) {
      logger.error("Error adding user:", error);
      toast.error("Erro ao adicionar usuário");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;
    try {
      await apiClient.delete(`/users/${userId}`);
      toast.success("Usuário removido");
      loadUsers();
    } catch (error) {
      logger.error("Error deleting user:", error);
      toast.error("Erro ao remover usuário");
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return;
    try {
      await apiClient.put(`/users/${selectedUser.id}/permissions`, {
        permissions: userPermissions,
      });
      toast.success("Permissões atualizadas");
      setSelectedUser(null);
    } catch (error) {
      logger.error("Error updating permissions:", error);
      toast.error("Erro ao atualizar permissões");
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedUser,
    setSelectedUser,
    modules,
    userPermissions,
    setUserPermissions,
    loadUsers,
    handleAddUser,
    handleDeleteUser,
    handleUpdatePermissions,
  };
}
