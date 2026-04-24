import { useState, useCallback } from "react";
import type { RepositoryFormData } from "../types";

const initialFormData: RepositoryFormData = {
  name: "",
  url: "",
  token: "",
  defaultBranch: "main",
  enableWebhooks: true,
};

export function useRepositoryForm(
  externalFormData?: RepositoryFormData,
  onChange?: <K extends keyof RepositoryFormData>(field: K, value: RepositoryFormData[K]) => void
) {
  const [internalFormData, setInternalFormData] = useState<RepositoryFormData>(
    externalFormData ?? initialFormData
  );

  const formData = externalFormData ?? internalFormData;

  const handleChange = useCallback(<K extends keyof RepositoryFormData>(
    field: K,
    value: RepositoryFormData[K]
  ) => {
    if (onChange) {
      onChange(field, value);
    } else {
      setInternalFormData((prev) => ({ ...prev, [field]: value }));
    }
  }, [onChange]);

  const resetForm = useCallback(() => {
    setInternalFormData(initialFormData);
  }, []);

  const isValid = formData.name && formData.url && formData.token;

  return {
    formData,
    handleChange,
    resetForm,
    isValid,
  };
}
