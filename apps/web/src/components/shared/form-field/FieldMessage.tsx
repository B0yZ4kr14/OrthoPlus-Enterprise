import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface FieldMessageProps {
  error?: string;
  success?: boolean;
  helperText?: string;
}

export function FieldMessage({
  error,
  success,
  helperText,
}: FieldMessageProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;
  const showHelperText = helperText && !hasError && !hasSuccess;

  if (hasError) {
    return (
      <div className="flex items-start gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (hasSuccess) {
    return (
      <div className="flex items-start gap-2 text-sm text-success dark:text-success">
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
        <span>Campo válido</span>
      </div>
    );
  }

  if (showHelperText) {
    return (
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{helperText}</span>
      </div>
    );
  }

  return null;
}
