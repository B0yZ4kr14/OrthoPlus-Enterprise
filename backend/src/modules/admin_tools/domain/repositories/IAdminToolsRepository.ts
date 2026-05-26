export interface IAdminToolsRepository {
  createUser(data: any): Promise<any>
  updateUserRole(email: string, role: string): Promise<any>
  getActiveConnections(): Promise<any>
  getTableSizes(): Promise<any>
  searchPatients(clinicId: string, query: string): Promise<any[]>
  searchDentists(clinicId: string, query: string): Promise<any[]>

  // ADR
  findAdrsByClinic(clinicId: string): Promise<any[]>
  createAdr(data: any): Promise<any>

  // Wiki
  findWikiPagesByClinic(clinicId: string): Promise<any[]>
  createWikiPage(data: any): Promise<any>
  findWikiPageByIdAndClinic(id: string, clinicId: string): Promise<any | null>
  updateWikiPage(id: string, data: any): Promise<any>
  deleteWikiPage(id: string, clinicId: string): Promise<any>
}
