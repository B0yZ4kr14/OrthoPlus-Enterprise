export interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
}

export interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
