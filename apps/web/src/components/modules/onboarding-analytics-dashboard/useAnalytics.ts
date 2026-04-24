// cspell:disable
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import type { AnalyticsData } from "./types";

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const events = await apiClient.get<Record<string, any>[]>("/onboarding_analytics?order=created_at.desc");

      const starts = events?.filter((e) => e.event_type === "started").length || 0;
      const completions = events?.filter((e) => e.event_type === "completed").length || 0;
      const abandoned = events?.filter((e) => e.event_type === "abandoned").length || 0;

      const completionRate = starts > 0 ? (completions / starts) * 100 : 0;

      const completedSessions = events?.filter((e) => e.event_type === "completed") || [];
      const totalTime = completedSessions.reduce((sum, e) => sum + (e.time_spent_seconds || 0), 0);
      const averageTime = completedSessions.length > 0 ? totalTime / completedSessions.length : 0;

      const stepEvents = events?.filter((e) => e.event_type === "step_completed") || [];
      const stepStatsMap = new Map<string, { count: number; totalTime: number }>();

      stepEvents.forEach((event) => {
        const key = `${event.step_number}-${event.step_name}`;
        const existing = stepStatsMap.get(key) || { count: 0, totalTime: 0 };
        stepStatsMap.set(key, {
          count: existing.count + 1,
          totalTime: existing.totalTime + (event.time_spent_seconds || 0),
        });
      });

      const stepStats = Array.from(stepStatsMap.entries())
        .map(([key, value]) => {
          const [stepNumber, stepName] = key.split("-");
          return {
            step_name: stepName,
            step_number: parseInt(stepNumber),
            completions: value.count,
            average_time: value.totalTime / value.count,
          };
        })
        .sort((a, b) => a.step_number - b.step_number);

      const abandonedEvents = events?.filter((e) => e.event_type === "abandoned") || [];
      const dropOffMap = new Map<string, number>();

      abandonedEvents.forEach((event) => {
        if (event.step_name) {
          dropOffMap.set(event.step_name, (dropOffMap.get(event.step_name) || 0) + 1);
        }
      });

      const dropOffByStep = Array.from(dropOffMap.entries()).map(([step_name, abandoned]) => ({
        step_name,
        abandoned,
      }));

      setAnalytics({
        totalStarts: starts,
        totalCompletions: completions,
        totalAbandoned: abandoned,
        completionRate,
        averageTimeSeconds: averageTime,
        stepStats,
        dropOffByStep,
      });
    } catch (error) {
      logger.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { analytics, loading };
}
