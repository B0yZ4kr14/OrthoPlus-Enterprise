import React, { memo } from "react";
import { AppointmentsChart } from "./AppointmentsChart";
import { RevenueChart } from "./RevenueChart";
import type { DashboardChartsProps } from "./types";

export const DashboardChartsMemo = memo<DashboardChartsProps>(
  ({ appointmentsData, revenueData }) => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentsChart data={appointmentsData} />
        <RevenueChart data={revenueData} />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.appointmentsData) ===
        JSON.stringify(nextProps.appointmentsData) &&
      JSON.stringify(prevProps.revenueData) ===
        JSON.stringify(nextProps.revenueData)
    );
  },
);

DashboardChartsMemo.displayName = "DashboardChartsMemo";
