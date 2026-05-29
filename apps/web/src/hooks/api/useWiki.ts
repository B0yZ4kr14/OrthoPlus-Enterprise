import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface WikiFormData {
  title: string;
  content: string;
  category: string;
  is_published: boolean;
}

export const useWiki = (
  clinicId: string | undefined,
  userId: string | undefined,
) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<WikiPage | null>(null);
  const [formData, setFormData] = useState<WikiFormData>({
    title: "",
    content: "",
    category: "general",
    is_published: false,
  });

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["wiki-pages", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const data = await apiClient.get<WikiPage[]>("/admin/wiki");
      return Array.isArray(data) ? data : [];
    },
    enabled: !!clinicId,
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      page,
      form,
    }: {
      page: WikiPage | null;
      form: WikiFormData;
    }) => {
      if (!clinicId) throw new Error("Missing clinic");

      if (page) {
        return apiClient.patch(`/admin/wiki/${page.id}`, {
          title: form.title,
          content: form.content,
          category: form.category,
          is_published: form.is_published,
        });
      }

      const slug = form.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      return apiClient.post("/admin/wiki", {
        clinic_id: clinicId,
        title: form.title,
        slug,
        content: form.content,
        category: form.category,
        is_published: form.is_published,
        created_by: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wiki-pages", clinicId] });
      toast.success(editingPage ? "Página atualizada" : "Página criada");
      setDialogOpen(false);
      setEditingPage(null);
      setFormData({
        title: "",
        content: "",
        category: "general",
        is_published: false,
      });
    },
    onError: () => {
      toast.error(
        editingPage ? "Erro ao salvar página" : "Erro ao criar página",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/admin/wiki/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wiki-pages", clinicId] });
      toast.success("Página deletada");
    },
    onError: () => {
      toast.error("Erro ao deletar página");
    },
  });

  const handleSave = () => {
    if (!clinicId || !formData.title.trim() || !formData.content.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    saveMutation.mutate({ page: editingPage, form: formData });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta página?")) return;
    deleteMutation.mutate(id);
  };

  const startEditing = (page: WikiPage) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      content: page.content,
      category: page.category,
      is_published: page.is_published,
    });
    setDialogOpen(true);
  };

  const startCreating = () => {
    setEditingPage(null);
    setFormData({
      title: "",
      content: "",
      category: "general",
      is_published: false,
    });
    setDialogOpen(true);
  };

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || page.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return {
    pages,
    filteredPages,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    dialogOpen,
    setDialogOpen,
    editingPage,
    formData,
    setFormData,
    handleSave,
    handleDelete,
    startEditing,
    startCreating,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
