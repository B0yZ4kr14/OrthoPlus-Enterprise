import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { ReportTemplate, TemplateFormData } from "./types";
import { DEFAULT_FORM_DATA } from "./types";

// Mock data para templates iniciais
const MOCK_TEMPLATES: ReportTemplate[] = [
  {
    id: "1",
    name: "Relatório Financeiro Mensal",
    description: "Visão geral das finanças do mês",
    category: "financeiro",
    metrics: ["receitas", "despesas", "lucro"],
    filters: {},
    layout: "dashboard",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Análise de Pacientes",
    description: "Métricas de aquisição e retenção",
    category: "pacientes",
    metrics: ["pacientes_novos", "pacientes_ativos"],
    filters: {},
    layout: "chart",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

interface UseReportTemplatesReturn {
  templates: ReportTemplate[];
  loading: boolean;
  isDialogOpen: boolean;
  editingTemplate: ReportTemplate | null;
  formData: TemplateFormData;
  setIsDialogOpen: (open: boolean) => void;
  setFormData: (data: TemplateFormData) => void;
  handleCreateTemplate: () => void;
  handleUpdateTemplate: () => void;
  handleDeleteTemplate: (id: string) => void;
  handleDuplicateTemplate: (template: ReportTemplate) => void;
  handleToggleActive: (id: string) => void;
  handleEditClick: (template: ReportTemplate) => void;
  handleCloseDialog: () => void;
  toggleMetric: (metricId: string) => void;
}

export function useReportTemplates(): UseReportTemplatesReturn {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(
    null,
  );
  const [formData, setFormData] = useState<TemplateFormData>(DEFAULT_FORM_DATA);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setTemplates(MOCK_TEMPLATES);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateTemplate = () => {
    if (!formData.name.trim()) {
      toast.error("Nome do template é obrigatório");
      return;
    }

    const newTemplate: ReportTemplate = {
      id: Math.random().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      metrics: formData.metrics,
      filters: {},
      layout: formData.layout,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setTemplates([...templates, newTemplate]);
    toast.success("Template criado com sucesso!");
    handleCloseDialog();
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;
    if (!formData.name.trim()) {
      toast.error("Nome do template é obrigatório");
      return;
    }

    const updatedTemplates = templates.map((t) =>
      t.id === editingTemplate.id
        ? {
            ...t,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            metrics: formData.metrics,
            layout: formData.layout,
          }
        : t,
    );

    setTemplates(updatedTemplates);
    toast.success("Template atualizado com sucesso!");
    handleCloseDialog();
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) return;

    setTemplates(templates.filter((t) => t.id !== id));
    toast.success("Template excluído com sucesso!");
  };

  const handleDuplicateTemplate = (template: ReportTemplate) => {
    const duplicated: ReportTemplate = {
      ...template,
      id: Math.random().toString(),
      name: `${template.name} (Cópia)`,
      created_at: new Date().toISOString(),
    };

    setTemplates([...templates, duplicated]);
    toast.success("Template duplicado com sucesso!");
  };

  const handleToggleActive = (id: string) => {
    const updatedTemplates = templates.map((t) =>
      t.id === id ? { ...t, is_active: !t.is_active } : t,
    );
    setTemplates(updatedTemplates);
  };

  const handleEditClick = (template: ReportTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      metrics: template.metrics,
      layout: template.layout,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const toggleMetric = (metricId: string) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter((m) => m !== metricId)
        : [...prev.metrics, metricId],
    }));
  };

  return {
    templates,
    loading,
    isDialogOpen,
    editingTemplate,
    formData,
    setIsDialogOpen,
    setFormData,
    handleCreateTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    handleDuplicateTemplate,
    handleToggleActive,
    handleEditClick,
    handleCloseDialog,
    toggleMetric,
  };
}
