// cspell:disable
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Template, User } from "./types";

export function usePermissionTemplates() {
  const { user, clinicId } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [applying, setApplying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const templatesData = await apiClient.get<Record<string, any>[]>(
        "/configuracoes/permissoes/templates",
      );
      setTemplates((templatesData || []) as Template[]);

      const profilesData = await apiClient.get<Record<string, any>[]>(
        "/configuracoes/usuarios",
      );

      const memberUsers =
        profilesData?.filter(
          (profile) => (profile.role || "MEMBER") === "MEMBER",
        ) || [];

      setUsers(memberUsers as User[]);
    } catch (error) {
      logger.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async (templateId: string, template: Template) => {
    if (!selectedUser) {
      toast.error("Selecione um usuário primeiro");
      return;
    }

    try {
      setApplying(templateId);

      const modulesData = await apiClient.get<Record<string, any>[]>(
        "/configuracoes/modulos",
        { params: { module_keys: template.module_keys.join(",") } },
      );

      await apiClient.delete(`/configuracoes/permissoes/${selectedUser}`);

      const permissions =
        modulesData?.map((module) => ({
          user_id: selectedUser,
          module_catalog_id: module.id,
          can_view: true,
          can_edit: false,
          can_delete: false,
        })) || [];

      await apiClient.post("/configuracoes/permissoes/batch", permissions);

      await apiClient.post("/configuracoes/permissoes/audit", {
        clinic_id: clinicId,
        user_id: user?.id,
        target_user_id: selectedUser,
        action: "TEMPLATE_APPLIED",
        template_name: template.name,
        details: {
          module_keys: template.module_keys,
          permissions_count: permissions.length,
        },
      });

      toast.success(`Template "${template.name}" aplicado com sucesso!`);
      setSelectedUser("");
    } catch (error) {
      logger.error("Erro ao aplicar template:", error);
      toast.error("Erro ao aplicar template");
    } finally {
      setApplying(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    templates,
    users,
    selectedUser,
    setSelectedUser,
    applying,
    loading,
    applyTemplate,
  };
}
