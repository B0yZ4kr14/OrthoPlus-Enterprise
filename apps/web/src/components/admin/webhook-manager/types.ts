export interface CommitInfo {
  length: number;
}

export interface PullRequestInfo {
  number?: number;
  title?: string;
}

export interface WorkflowInfo {
  name?: string;
  status?: string;
}

export interface EventData {
  commits?: CommitInfo | unknown[];
  pull_requests?: PullRequestInfo[];
  workflows?: WorkflowInfo[];
}

export interface GitHubEvent {
  id: string;
  clinic_id: string;
  event_type: string;
  event_data: EventData;
  triggered_by: string;
  created_at: string;
}
