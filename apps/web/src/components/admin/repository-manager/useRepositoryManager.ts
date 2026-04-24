// cspell:disable
import { useState } from "react";
import { useGitHubTools } from "@/hooks/api/useGitHubTools";
import { toast } from "sonner";
import type { RepositoryFormData } from "./types";

export function useRepositoryManager() {
  const {
    repos,
    isLoadingRepos,
    autenticarGitHub,
    executarWorkflow,
    isAutenticando,
  } = useGitHubTools();
  
  const [showForm, setShowForm] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [formData, setFormData] = useState<RepositoryFormData>({
    name: "",
    url: "",
    token: "",
    defaultBranch: "main",
    enableWebhooks: false,
  });

  const handleTestConnection = async () => {
    if (!formData.token) {
      toast.error("Token de acesso obrigatório");
      return;
    }

    setTestingConnection(true);
    try {
      await autenticarGitHub({ github_token: formData.token });
      toast.success("Conexão testada com sucesso!");
    } catch (error) {
      toast.error("Erro ao testar conexão");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleConnectRepo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.url || !formData.token) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await autenticarGitHub({ github_token: formData.token });
      toast.success("Repositório conectado com sucesso!");
      setShowForm(false);
      setFormData({
        name: "",
        url: "",
        token: "",
        defaultBranch: "main",
        enableWebhooks: false,
      });
    } catch (error) {
      toast.error("Erro ao conectar repositório");
    }
  };

  const handleExecuteWorkflow = async (
    repoName: string,
    workflowId: string,
    branch: string
  ) => {
    try {
      await executarWorkflow({
        repo_name: repoName,
        workflow_id: workflowId,
        ref: branch,
      });
    } catch (error) {
      toast.error("Erro ao executar workflow");
    }
  };

  const updateFormData = <K extends keyof RepositoryFormData>(
    field: K,
    value: RepositoryFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    repos,
    isLoadingRepos,
    showForm,
    setShowForm,
    testingConnection,
    formData,
    isAutenticando,
    handleTestConnection,
    handleConnectRepo,
    handleExecuteWorkflow,
    updateFormData,
  };
}
