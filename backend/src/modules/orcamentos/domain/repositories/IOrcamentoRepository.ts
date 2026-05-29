import { Prisma } from "@prisma/client";
import type { orcamentos, orcamento_itens } from "@prisma/client";

/**
 * IOrcamentoRepository — interface for orcamentos module database access.
 * Decouples OrcamentoService from Prisma / infrastructure details.
 */
export interface IOrcamentoRepository {
  listOrcamentos(
    clinicId: string,
    filters?: { patient_id?: string; status?: string },
  ): Promise<orcamentos[]>;
  getOrcamentoById(id: string, clinicId: string): Promise<orcamentos | null>;
  createOrcamento(data: Prisma.orcamentosCreateInput): Promise<orcamentos>;
  updateOrcamento(
    id: string,
    data: Prisma.orcamentosUpdateInput,
  ): Promise<orcamentos>;
  deleteOrcamento(id: string): Promise<orcamentos>;
  listItems(orcamentoId: string): Promise<orcamento_itens[]>;
  addItem(data: Prisma.orcamento_itensCreateInput): Promise<orcamento_itens>;
}
