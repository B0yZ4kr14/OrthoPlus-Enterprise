export interface ICRMRepository {
  findManyLeads(where: Record<string, unknown>): Promise<unknown[]>;
  findLeadById(id: string, clinicId: string): Promise<unknown | null>;
  createLead(data: Record<string, unknown>): Promise<unknown>;
  updateLead(id: string, data: Record<string, unknown>): Promise<unknown>;
  deleteLead(id: string): Promise<void>;
}
