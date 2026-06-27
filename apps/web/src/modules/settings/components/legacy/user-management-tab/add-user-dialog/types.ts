import type { NewUserFormData } from "../types";

export type { NewUserFormData };

export interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NewUserFormData) => void;
}

export interface UserFormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export interface RoleSelectProps {
  value: string;
  onChange: (value: "ADMIN" | "MEMBER" | "ROOT") => void;
}
