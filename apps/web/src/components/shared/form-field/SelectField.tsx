import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  hasError: boolean;
  hasSuccess: boolean;
}

export function SelectField({
  id,
  value,
  onChange,
  disabled,
  placeholder,
  options,
  hasError,
  hasSuccess,
}: SelectFieldProps) {
  return (
    <div className="relative">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className={cn(
            hasError && "border-destructive focus:ring-destructive",
            hasSuccess && "border-green-500 focus:ring-green-500",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(hasError || hasSuccess) && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          {hasError && <AlertCircle className="h-5 w-5 text-destructive" />}
          {hasSuccess && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </div>
      )}
    </div>
  );
}
