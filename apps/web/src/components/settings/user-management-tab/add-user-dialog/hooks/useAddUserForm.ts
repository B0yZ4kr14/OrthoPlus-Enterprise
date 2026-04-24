import { useState } from "react";
import type { NewUserFormData } from "../types";

const INITIAL_FORM_DATA: NewUserFormData = {
  email: "",
  name: "",
  password: "",
  role: "MEMBER",
};

export function useAddUserForm(onSubmit: (data: NewUserFormData) => void) {
  const [formData, setFormData] = useState<NewUserFormData>(INITIAL_FORM_DATA);

  const updateField = <K extends keyof NewUserFormData>(
    field: K,
    value: NewUserFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(INITIAL_FORM_DATA);
  };

  return {
    formData,
    updateField,
    handleSubmit,
  };
}
