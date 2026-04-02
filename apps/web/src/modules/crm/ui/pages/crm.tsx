import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import { Lead } from "@/modules/crm/domain/entities/Lead";
import { LeadKanban } from "@/modules/crm/presentation/components/LeadKanban";
import { LeadForm } from "@/modules/crm/presentation/components/LeadForm";
import { LeadCard } from "@/modules/crm/presentation/components/LeadCard";
import { Button } from "@orthoplus/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { Plus, Users, LayoutGrid } from "lucide-react";

const CRMPage = () => {
  const { deleteLead } = useLeads();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setLeadToEdit(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            CRM - Funil de Vendas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus leads e oportunidades de negócio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={view} onValueChange={(v) => setView(v as unknown)}>
            <TabsList>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            onClick={() => {
              setLeadToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      {view === "kanban" && <LeadKanban onLeadClick={handleLeadClick} />}

      <Dialog
        open={isFormOpen || !!leadToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setLeadToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {leadToEdit ? "Editar Lead" : "Criar Novo Lead"}
            </DialogTitle>
          </DialogHeader>
          <LeadForm
            lead={leadToEdit || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false);
              setLeadToEdit(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <LeadCard
              lead={selectedLead}
              onEdit={(lead) => {
                setSelectedLead(null);
                setLeadToEdit(lead);
              }}
              onDelete={(lead) => {
                deleteLead(lead.id);
                setSelectedLead(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMPage;
