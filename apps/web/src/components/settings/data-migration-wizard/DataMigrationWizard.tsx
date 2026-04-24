// cspell:disable
import { Dialog, DialogContent } from "@orthoplus/core-ui/dialog";
import { useDataMigration } from "./useDataMigration";
import { WizardHeader } from "./WizardHeader";
import { ProgressIndicator } from "./ProgressIndicator";
import { WizardActions } from "./WizardActions";
import {
  ExportDataSelectionStep,
  ExportConfirmStep,
  ImportFileUploadStep,
  ImportPreviewStep,
  ImportOptionsStep,
  MigrationResultsStep,
} from "../data-migration";
import type { DataMigrationWizardProps } from "./types";

export function DataMigrationWizard({ open, onClose, mode }: DataMigrationWizardProps) {
  const {
    step,
    totalSteps,
    loading,
    progress,
    exportOptions,
    importOptions,
    importFile,
    importData,
    importResults,
    setExportOptions,
    setImportOptions,
    handleExport,
    handleImport,
    handleFileUpload,
    nextStep,
    prevStep,
  } = useDataMigration(mode, onClose);

  const renderStepContent = () => {
    if (mode === "export") {
      if (step === 1) return <ExportDataSelectionStep exportOptions={exportOptions} setExportOptions={setExportOptions} />;
      if (step === 2) return <ExportConfirmStep exportOptions={exportOptions} setExportOptions={setExportOptions} loading={loading} progress={progress} />;
      if (step === 3) return <MigrationResultsStep mode="export" importResults={null} />;
    } else {
      if (step === 1) return <ImportFileUploadStep importFile={importFile} onFileUpload={handleFileUpload} />;
      if (step === 2) return <ImportPreviewStep importData={importData} />;
      if (step === 3) return <ImportOptionsStep importOptions={importOptions} setImportOptions={setImportOptions} loading={loading} progress={progress} />;
      if (step === 4) return <MigrationResultsStep mode="import" importResults={importResults} />;
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <WizardHeader mode={mode} />
        <div className="space-y-6">
          <ProgressIndicator step={step} totalSteps={totalSteps} />
          {renderStepContent()}
          <WizardActions
            step={step}
            totalSteps={totalSteps}
            mode={mode}
            loading={loading}
            importData={importData}
            onClose={onClose}
            onPrev={prevStep}
            onNext={nextStep}
            onExport={handleExport}
            onImport={handleImport}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
