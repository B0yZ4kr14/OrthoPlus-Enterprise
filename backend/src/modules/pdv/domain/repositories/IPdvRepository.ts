import { Prisma } from "@prisma/client";
import type { pdv_vendas } from "@prisma/client";

/**
 * IPdvRepository — interface for pdv module database access.
 * Decouples controllers from Prisma / infrastructure details.
 */
export interface IPdvRepository {
  createVenda(data: Prisma.pdv_vendasCreateInput): Promise<pdv_vendas>;
  findVendasByClinic(clinicId: string): Promise<pdv_vendas[]>;
  findVendaById(id: string, clinicId: string): Promise<pdv_vendas | null>;
  updateVenda(
    id: string,
    data: Prisma.pdv_vendasUpdateInput,
  ): Promise<pdv_vendas>;
}
