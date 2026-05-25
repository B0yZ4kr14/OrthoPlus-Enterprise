import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/apiClient"
import { toast } from "sonner"

export interface Usuario {
  id: string
  email: string
  full_name: string
  app_role: "ADMIN" | "MEMBER"
  clinic_id: string
  avatar_url?: string
  is_active: boolean
  last_sign_in_at?: string
  created_at: string
}

export const useUsuariosPage = (clinicId: string | undefined) => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: users = [], isLoading } = useQuery<Usuario[]>({
    queryKey: ["users", clinicId],
    queryFn: async () => {
      const response = await apiClient.get<Usuario[]>("/usuarios")
      return Array.isArray(response) ? response : []
    },
    enabled: !!clinicId,
  })

  const filteredUsers =
    users?.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === "all" || user.app_role === roleFilter

      return matchesSearch && matchesRole
    }) || []

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/usuarios/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", clinicId] })
      toast.success("Usuário excluído com sucesso!")
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error("Erro ao excluir usuário", { description: msg })
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      await apiClient.post(`/usuarios/${userId}/toggle-active`, {
        is_active: !isActive,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", clinicId] })
    },
  })

  const handleEdit = (user: Usuario) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleDelete = (userId: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.",
      )
    ) {
      deleteUserMutation.mutate(userId)
    }
  }

  const handleToggleActive = (userId: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ userId, isActive })
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedUser(null)
  }

  return {
    users,
    filteredUsers,
    isLoading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    selectedUser,
    setSelectedUser,
    isDialogOpen,
    setIsDialogOpen,
    handleEdit,
    handleDelete,
    handleToggleActive,
    handleDialogClose,
    isDeleting: deleteUserMutation.isPending,
    isToggling: toggleActiveMutation.isPending,
  }
}
