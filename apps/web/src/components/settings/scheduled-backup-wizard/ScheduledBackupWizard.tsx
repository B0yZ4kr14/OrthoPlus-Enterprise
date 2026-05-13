// cspell:disable
import { Dialog, DialogContent } from "@orthoplus/core-ui/dialog";
import { useBackupWizard } from "./useBackupWizard";
import { WizardHeader } from "./WizardHeader";
import { WizardNavigation } from "./WizardNavigation";
// TODO: criar componentes de steps
const BasicInfoStep = (props: any) => null;
const BackupTypeStep = (props: any) => null;
const DataToIncludeStep = (props: any) => null;
const AdvancedOptionsStep = (props: any) => null;
const DestinationStep = (props: any) => null;
const SummaryStep = (props: any) => null;
import type { ScheduledBackupWizardProps } from "./types";

export function ScheduledBackupWizard({ open, onClose, initialData }: ScheduledBackupWizardProps) {
  const {
    step,
    totalSteps,
    progress,
    loading,
    config,
    nextExecutions,
    nextStep,
    prevStep,
    handleSubmit,
    updateConfig,
  } = useBackupWizard({ open, onClose, initialData });

  const stepComponents = [
    <BasicInfoStep key={1} config={config} setConfig={updateConfig} />,
    <BackupTypeStep key={2} config={config} setConfig={updateConfig} />,
    <DataToIncludeStep key={3} config={config} setConfig={updateConfig} />,
    <AdvancedOptionsStep key={4} config={config} setConfig={updateConfig} />,
    <DestinationStep key={5} config={config} setConfig={updateConfig} />,
    <SummaryStep key={6} config={config} setConfig={updateConfig} nextExecutions={nextExecutions} />,
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <WizardHeader isEditing={!!initialData?.id} progress={progress} />
        {stepComponents[step - 1]}
        <WizardNavigation
          step={step}
          totalSteps={totalSteps}
          loading={loading}
          canSubmit={!!config.name}
          onPrev={prevStep}
          onNext={nextStep}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
