// cspell:disable
import { useRepositoryManager } from "./useRepositoryManager";
import { RepositoryList } from "./RepositoryList";
import { AddRepositoryForm } from "./AddRepositoryForm";

export function RepositoryManager() {
  const {
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
  } = useRepositoryManager();

  return (
    <div className="space-y-6">
      <RepositoryList
        repos={repos}
        isLoading={isLoadingRepos}
        onAddRepo={() => setShowForm(!showForm)}
        onExecuteWorkflow={handleExecuteWorkflow}
      />

      {showForm && (
        <AddRepositoryForm
          formData={formData}
          testingConnection={testingConnection}
          isAutenticando={isAutenticando}
          onSubmit={handleConnectRepo}
          onTestConnection={handleTestConnection}
          onChange={updateFormData}
        />
      )}
    </div>
  );
}
