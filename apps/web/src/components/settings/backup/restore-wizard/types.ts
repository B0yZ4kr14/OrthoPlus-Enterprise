export interface RestoreWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface BackupOption {
  id: string;
  date: string;
  type: string;
  size: string;
  status: string;
}

export interface PreviewItem {
  label: string;
  count: string;
  icon: React.ComponentType<{ className?: string }>;
}
