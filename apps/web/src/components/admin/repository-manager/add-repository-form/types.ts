export interface RepositoryFormData {
  name: string;
  url: string;
  token: string;
  defaultBranch: string;
  enableWebhooks: boolean;
}

export interface AddRepositoryFormProps {
  formData: RepositoryFormData;
  testingConnection: boolean;
  isAutenticando: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onTestConnection: () => void;
  onChange: <K extends keyof RepositoryFormData>(field: K, value: RepositoryFormData[K]) => void;
}
