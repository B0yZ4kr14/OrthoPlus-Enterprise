export interface AberturaCaixaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (valorInicial: number, observacoes: string) => Promise<void>;
}

export interface UseAberturaCaixaReturn {
  valorInicial: string;
  setValorInicial: (value: string) => void;
  observacoes: string;
  setObservacoes: (value: string) => void;
  loading: boolean;
  handleSubmit: () => Promise<void>;
}
