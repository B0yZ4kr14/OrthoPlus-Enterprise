/**
 * FASE 3: CRM - Hook React para gerenciar Leads
 */

import { useAuth } from "@/contexts/AuthContext";
import { UpdateLeadStatusUseCase } from "@/modules/crm/application/use-cases/UpdateLeadStatusUseCase";
import {
  Lead,
  LeadSource,
  LeadStatus,
} from "@/modules/crm/domain/entities/Lead";
import { LeadRepositoryApi } from "@/modules/crm/infrastructure/repositories/LeadRepositoryApi";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const leadRepository = new LeadRepositoryApi();
const updateLeadStatusUseCase = new UpdateLeadStatusUseCase(leadRepository);

export function useLeads() {
  const { clinicId, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedLeads = await leadRepository.findByClinicId(clinicId);
      setLeads(fetchedLeads);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar leads";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const createLead = useCallback(
    async (input: {
      nome: string;
      email?: string;
      telefone?: string;
      origem: LeadSource;
      valorEstimado?: number;
      interesseDescricao?: string;
    }) => {
      if (!clinicId || !user) {
        toast.error("Usuário não autenticado");
        return;
      }

      try {
        // Criar diretamente usando entidade de domínio
        const lead = new Lead({
          id: crypto.randomUUID(),
          clinicId,
          nome: input.nome,
          email: input.email,
          telefone: input.telefone,
          origem: input.origem,
          status: "NOVO" as LeadStatus,
          interesseDescricao: input.interesseDescricao,
          valorEstimado: input.valorEstimado,
          responsavelId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const savedLead = await leadRepository.save(lead);

        toast.success("Lead criado com sucesso");
        await loadLeads();
        return savedLead;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao criar lead";
        toast.error(errorMessage);
        throw err;
      }
    },
    [clinicId, user, loadLeads],
  );

  const updateLeadStatus = useCallback(
    async (
      leadId: string,
      newStatus:
        | "NOVO"
        | "CONTATO_INICIAL"
        | "QUALIFICADO"
        | "PROPOSTA"
        | "NEGOCIACAO"
        | "GANHO"
        | "PERDIDO",
    ) => {
      try {
        await updateLeadStatusUseCase.execute({
          leadId,
          newStatus,
        });

        toast.success("Status atualizado com sucesso");
        await loadLeads();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao atualizar status";
        toast.error(errorMessage);
        throw err;
      }
    },
    [loadLeads],
  );

  const updateLead = useCallback(
    async (
      leadId: string,
      input: {
        nome?: string;
        email?: string;
        telefone?: string;
        origem?: LeadSource;
        valorEstimado?: number;
        interesseDescricao?: string;
        observacoes?: string;
      },
    ) => {
      try {
        const existingLead = leads.find((l) => l.id === leadId);
        if (!existingLead) throw new Error("Lead não encontrado");

        // Criar nova instância com dados atualizados
        const updatedLead = new Lead({
          ...existingLead.toJSON(),
          ...input,
          updatedAt: new Date(),
        });

        await leadRepository.update(updatedLead);

        toast.success("Lead atualizado com sucesso");
        await loadLeads();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao atualizar lead";
        toast.error(errorMessage);
        throw err;
      }
    },
    [leads, loadLeads],
  );

  const deleteLead = useCallback(
    async (leadId: string) => {
      if (!confirm("Tem certeza que deseja excluir este lead?")) return;

      try {
        await leadRepository.delete(leadId);
        toast.success("Lead excluído com sucesso");
        await loadLeads();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao excluir lead";
        toast.error(errorMessage);
        throw err;
      }
    },
    [loadLeads],
  );

  return {
    leads,
    loading,
    error,
    createLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
    reloadLeads: loadLeads,
  };
}
