import { ReactNode } from "react";
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import { Textarea } from "@orthoplus/core-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseFormFieldProps {
  label: string;
  name: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  required?: boolean;
  className?: string;
}

interface InputFormFieldProps extends BaseFormFieldProps {
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "date"
    | "time";
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

interface TextareaFormFieldProps extends BaseFormFieldProps {
  type: "textarea";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
}

interface SelectFormFieldProps extends BaseFormFieldProps {
  type: "select";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  options: Array<{ value: string; label: string }>;
}

interface CustomFormFieldProps extends BaseFormFieldProps {
  type: "custom";
  children: ReactNode;
}

type FormFieldProps =
  | InputFormFieldProps
  | TextareaFormFieldProps
  | SelectFormFieldProps
  | CustomFormFieldProps;

export function FormField(props: FormFieldProps) {
  const { label, name, error, success, helperText, required, className } =
    props;

  const hasError = !!error;
  const hasSuccess = success && !hasError;
  const showHelperText = helperText && !hasError && !hasSuccess;

  const renderInput = () => {
    if (props.type === "textarea") {
      return (
        <div className="relative">
          <Textarea
            id={name}
            name={name}
            placeholder={props.placeholder}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            disabled={props.disabled}
            rows={props.rows}
            maxLength={props.maxLength}
            className={cn(
              "pr-10",
              hasError && "border-destructive focus-visible:ring-destructive",
              hasSuccess && "border-green-500 focus-visible:ring-green-500",
            )}
          />
          {(hasError || hasSuccess) && (
            <div className="absolute right-3 top-3">
              {hasError && <AlertCircle className="h-5 w-5 text-destructive" />}
              {hasSuccess && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>
      );
    }

    if (props.type === "select") {
      return (
        <div className="relative">
          <Select
            value={props.value}
            onValueChange={props.onChange}
            disabled={props.disabled}
          >
            <SelectTrigger
              id={name}
              className={cn(
                hasError && "border-destructive focus:ring-destructive",
                hasSuccess && "border-green-500 focus:ring-green-500",
              )}
            >
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(hasError || hasSuccess) && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              {hasError && <AlertCircle className="h-5 w-5 text-destructive" />}
              {hasSuccess && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>
      );
    }

    if (props.type === "custom") {
      return props.children;
    }

    // Default: input
    return (
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={props.type || "text"}
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          disabled={props.disabled}
          maxLength={props.maxLength}
          className={cn(
            "pr-10",
            hasError && "border-destructive focus-visible:ring-destructive",
            hasSuccess && "border-green-500 focus-visible:ring-green-500",
          )}
        />
        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError && <AlertCircle className="h-5 w-5 text-destructive" />}
            {hasSuccess && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderInput()}
      {hasError && (
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {hasSuccess && (
        <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-500">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Campo válido</span>
        </div>
      )}
      {showHelperText && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{helperText}</span>
        </div>
      )}
    </div>
  );
}
