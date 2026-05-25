import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/apiClient"
import { toast } from "sonner"

export interface ADR {
  id: string
  adr_number: number
  title: string
  status: "proposed" | "accepted" | "deprecated" | "superseded"
  context: string
  decision: string
  consequences: string
  created_at: string
  decided_at: string | null
}

export interface ADRFormData {
  title: string
  context: string
  decision: string
  consequences: string
  alternatives_considered: string
  status: "proposed" | "accepted" | "deprecated" | "superseded"
}

export const useADRs = (clinicId: string | undefined, userId: string | undefined) => {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ADRFormData>({
    title: "",
    context: "",
    decision: "",
    consequences: "",
    alternatives_considered: "",
    status: "proposed",
  })

  const { data: adrs = [], isLoading } = useQuery<ADR[]>({
    queryKey: ["adrs", clinicId],
    queryFn: async () => {
      if (!clinicId) return []
      const data = await apiClient.get<ADR[]>("/admin/adrs")
      return Array.isArray(data) ? data : []
    },
    enabled: !!clinicId,
  })

  const createMutation = useMutation({
    mutationFn: async ({ form, nextNumber }: { form: ADRFormData; nextNumber: number }) => {
      if (!clinicId || !userId) throw new Error("Missing clinic or user")
      return apiClient.post("/admin/adrs", {
        clinic_id: clinicId,
        adr_number: nextNumber,
        ...form,
        created_by: userId,
        decided_by: form.status === "accepted" ? userId : undefined,
        decided_at: form.status === "accepted" ? new Date().toISOString() : undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adrs", clinicId] })
      toast.success("ADR criado com sucesso")
      setDialogOpen(false)
      setFormData({
        title: "",
        context: "",
        decision: "",
        consequences: "",
        alternatives_considered: "",
        status: "proposed",
      })
    },
    onError: () => {
      toast.error("Erro ao criar ADR")
    },
  })

  const handleCreate = () => {
    if (!clinicId || !formData.title.trim()) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }
    const nextNumber = adrs.length > 0 ? Math.max(...adrs.map((a) => a.adr_number)) + 1 : 1
    createMutation.mutate({ form: formData, nextNumber })
  }

  return {
    adrs,
    isLoading,
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    handleCreate,
    isCreating: createMutation.isPending,
  }
}
