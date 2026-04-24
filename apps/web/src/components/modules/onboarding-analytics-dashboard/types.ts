// cspell:disable
export interface StepStat {
  step_name: string;
  step_number: number;
  completions: number;
  average_time: number;
}

export interface DropOffData {
  step_name: string;
  abandoned: number;
}

export interface AnalyticsData {
  totalStarts: number;
  totalCompletions: number;
  totalAbandoned: number;
  completionRate: number;
  averageTimeSeconds: number;
  stepStats: StepStat[];
  dropOffByStep: DropOffData[];
}
