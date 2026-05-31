import { Prisma } from "@prisma/client";
import type { contratos, contrato_templates } from "@prisma/client";

/**
 * IContratosRepository — interface for contratos module Prisma database access.
 * Decouples ContratosController from Prisma / infrastructure details.
 */
export interface IContratosRepository {
  listContratos(clinicId: string): Promise<contratos[]>;
  getContratoById(id: string, clinicId: string): Promise<contratos | null>;
  createContrato(data: Prisma.contratosCreateInput): Promise<contratos>;
  updateContrato(
    id: string,
    clinicId: string,
    data: Prisma.contratosUpdateInput,
  ): Promise<contratos>;
  deleteContrato(id: string, clinicId: string): Promise<contratos>;
  listTemplates(): Promise<contrato_templates[]>;
}
