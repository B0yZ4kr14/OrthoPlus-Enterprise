export interface IBIRepository {
  findManyDashboards(clinicId: string): Promise<unknown[]>;
  findDashboardById(id: string, clinicId: string): Promise<unknown | null>;
  createDashboard(data: Record<string, unknown>): Promise<unknown>;
  updateDashboard(id: string, clinicId: string, data: Record<string, unknown>): Promise<unknown>;

  findManyMetricas(where: Record<string, unknown>): Promise<unknown[]>;

  findManyWidgets(dashboardId: string, clinicId: string): Promise<unknown[]>;
  createWidget(data: Record<string, unknown>): Promise<unknown>;
  findWidgetById(id: string, clinicId: string): Promise<unknown | null>;
  updateWidget(id: string, clinicId: string, data: Record<string, unknown>): Promise<unknown>;
  deleteWidget(id: string, clinicId: string): Promise<void>;
}
