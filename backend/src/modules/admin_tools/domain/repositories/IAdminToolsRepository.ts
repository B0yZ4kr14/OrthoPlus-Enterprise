// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminToolResult = any;

export interface IAdminToolsRepository {
  createUser(data: Record<string, unknown>): Promise<AdminToolResult>;
  updateUserRole(email: string, role: string): Promise<AdminToolResult>;
  getActiveConnections(): Promise<AdminToolResult>;
  getTableSizes(): Promise<AdminToolResult>;
  searchPatients(clinicId: string, query: string): Promise<AdminToolResult[]>;
  searchDentists(clinicId: string, query: string): Promise<AdminToolResult[]>;
  runVacuumAnalyze(): Promise<void>;

  // ADR
  findAdrsByClinic(clinicId: string): Promise<AdminToolResult[]>;
  createAdr(data: Record<string, unknown>): Promise<AdminToolResult>;

  // Wiki
  findWikiPagesByClinic(clinicId: string): Promise<AdminToolResult[]>;
  createWikiPage(data: Record<string, unknown>): Promise<AdminToolResult>;
  findWikiPageByIdAndClinic(id: string, clinicId: string): Promise<AdminToolResult | null>;
  updateWikiPage(id: string, data: Record<string, unknown>): Promise<AdminToolResult>;
  deleteWikiPage(id: string, clinicId: string): Promise<AdminToolResult>;
}
