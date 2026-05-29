import type {
  DashboardOverviewDTO,
  DashboardChartData,
} from "@orthoplus/shared-types";
import type { DashboardOverviewResult } from "../GetDashboardOverviewUseCase";

/**
 * Maps DashboardOverviewResult to DashboardOverviewDTO.
 * Architecture Refactor T5.2 — Entity-to-DTO mapper.
 */
export class DashboardOverviewMapper {
  static toDTO(result: DashboardOverviewResult): DashboardOverviewDTO {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const charts: DashboardChartData = {
      labels: result.appointmentsData.map((d) => d.name),
      revenue: result.revenueData.map((d) => d.receita),
      expenses: result.revenueData.map((d) => d.despesas),
      appointments: result.appointmentsData.map((d) => d.agendadas),
      newPatients: result.treatmentsByStatus.map((d) => d.value),
    };

    return {
      stats: result.stats,
      charts,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      },
    };
  }
}
