// cspell:disable
export interface RepositoryFormData {
  name: string;
  url: string;
  token: string;
  defaultBranch: string;
  enableWebhooks: boolean;
}

export interface Repository {
  id: string;
  full_name: string;
  name: string;
  description?: string;
  url: string;
  private: boolean;
}
