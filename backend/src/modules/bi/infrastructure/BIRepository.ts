import { prisma } from "@/infrastructure/database/prismaClient";
import { IBIRepository } from "../domain/repositories/IBIRepository";

export class BIRepository implements IBIRepository {
  async findManyDashboards(clinicId: string) {
    return prisma.bi_dashboards.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    });
  }

  async findDashboardById(id: string, clinicId: string) {
    return prisma.bi_dashboards.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createDashboard(data: Record<string, unknown>) {
    return prisma.bi_dashboards.create({ data: data as any });
  }

  async updateDashboard(id: string, clinicId: string, data: Record<string, unknown>) {
    return prisma.bi_dashboards.update({ where: { id, clinic_id: clinicId }, data: data as any });
  }

  async findManyMetricas(where: Record<string, unknown>) {
    return prisma.bi_metrics.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
    });
  }

  async findManyWidgets(dashboardId: string, clinicId: string) {
    return prisma.bi_widgets.findMany({
      where: { dashboard_id: dashboardId, clinic_id: clinicId },
      orderBy: { position_y: "asc" },
    });
  }

  async createWidget(data: Record<string, unknown>) {
    return prisma.bi_widgets.create({ data: data as any });
  }

  async findWidgetById(id: string, clinicId: string) {
    return prisma.bi_widgets.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateWidget(id: string, clinicId: string, data: Record<string, unknown>) {
    return prisma.bi_widgets.update({ where: { id, clinic_id: clinicId }, data: data as any });
  }

  async deleteWidget(id: string, clinicId: string) {
    await prisma.bi_widgets.delete({ where: { id, clinic_id: clinicId } });
  }
}
