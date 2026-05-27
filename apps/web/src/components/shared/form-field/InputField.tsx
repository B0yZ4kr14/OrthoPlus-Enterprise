import { Input } from "@orthoplus/core-ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
  hasError: boolean;
  hasSuccess: boolean;
}

export function InputField({
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
  maxLength,
  hasError,
  hasSuccess,
}: InputFieldProps) {
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(
          "pr-10",
          hasError && "border-destructive focus-visible:ring-destructive",
          hasSuccess && "border-success focus-visible:ring-success",
        )}
      />
      {(hasError || hasSuccess) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {hasError && <AlertCircle className="h-5 w-5 text-destructive" />}
          {hasSuccess && <CheckCircle2 className="h-5 w-5 text-success" />}
        </div>
      )}
    </div>
  );
}
