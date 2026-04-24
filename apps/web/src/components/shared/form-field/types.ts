import type { ReactNode } from "react";

export interface BaseFormFieldProps {
  label: string;
  name: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export interface InputFormFieldProps extends BaseFormFieldProps {
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

export interface TextareaFormFieldProps extends BaseFormFieldProps {
  type: "textarea";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
}

export interface SelectFormFieldProps extends BaseFormFieldProps {
  type: "select";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  options: Array<{ value: string; label: string }>;
}

export interface CustomFormFieldProps extends BaseFormFieldProps {
  type: "custom";
  children: ReactNode;
}

export type FormFieldProps =
  | InputFormFieldProps
  | TextareaFormFieldProps
  | SelectFormFieldProps
  | CustomFormFieldProps;
