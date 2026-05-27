import { Textarea } from "@orthoplus/core-ui/textarea";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextareaFieldProps {
  id: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  hasError: boolean;
  hasSuccess: boolean;
}

export function TextareaField({
  id,
  name,
  placeholder,
  value,
  onChange,
  disabled,
  rows,
  maxLength,
  hasError,
  hasSuccess,
}: TextareaFieldProps) {
  return (
    <div className="relative">
      <Textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          "pr-10",
          hasError && "border-destructive focus-visible:ring-destructive",
          hasSuccess && "border-success focus-visible:ring-success",
        )}
      />
      {(hasError || hasSuccess) && (
        <div className="absolute right-3 top-3">
          {hasError && <AlertCircle className="h-5 w-5 text-destructive" />}
          {hasSuccess && <CheckCircle2 className="h-5 w-5 text-success" />}
        </div>
      )}
    </div>
  );
}
