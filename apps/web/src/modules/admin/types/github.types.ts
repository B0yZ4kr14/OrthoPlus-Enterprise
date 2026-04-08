export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  branch: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  author: string;
  created_at: string;
  base: string;
  head: string;
  state: "open" | "closed" | "merged";
}

export interface GitHubBranch {
  name: string;
  last_commit: string;
  protected: boolean;
}

export interface GitHubWorkflow {
  name: string;
  last_run: string;
  duration: string;
  status: "success" | "failure" | "in_progress" | "queued";
}

export interface GitHubData {
  commits: GitHubCommit[];
  branches: GitHubBranch[];
  pull_requests: GitHubPullRequest[];
  workflows: GitHubWorkflow[];
}
