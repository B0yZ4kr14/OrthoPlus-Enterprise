export interface AppointmentDataPoint {
  name: string;
  agendadas: number;
  realizadas: number;
}

export interface RevenueDataPoint {
  name: string;
  receita: number;
  despesas: number;
}

export interface DashboardChartsProps {
  appointmentsData: AppointmentDataPoint[];
  revenueData: RevenueDataPoint[];
}
