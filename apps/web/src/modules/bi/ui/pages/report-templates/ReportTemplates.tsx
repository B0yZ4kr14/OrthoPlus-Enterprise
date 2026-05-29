/**
 * ReportTemplates - Componente Orquestrador (Refatorado)
 *
 * ANTES: 511 linhas
 * DEPOIS: ~80 linhas + estrutura modular
 */

import { Navigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useReportTemplates } from "./useReportTemplates";
import { TemplateForm } from "./TemplateForm";
import { TemplatesList } from "./TemplatesList";
import { Loader2 } from "lucide-react";

export default function ReportTemplates() {
  const { hasRole } = useAuth();
  const {
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
  } = useReportTemplates();

  if (!hasRole("ADMIN")) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSubmit = () => {
    if (editingTemplate) {
      handleUpdateTemplate();
    } else {
      handleCreateTemplate();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates de Relatórios"
        icon={FileText}
        description="Crie e gerencie templates personalizados para relatórios do sistema"
      />

      <div className="flex justify-end">
        <TemplateForm
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingTemplate={editingTemplate}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCloseDialog}
          toggleMetric={toggleMetric}
        />
      </div>

      <TemplatesList
        templates={templates}
        onEdit={handleEditClick}
        onDelete={handleDeleteTemplate}
        onDuplicate={handleDuplicateTemplate}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
}
