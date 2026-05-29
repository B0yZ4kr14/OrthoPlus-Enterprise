import { useState, useCallback } from "react";
import type { PatientStatus } from "../types";

export function useStatusSelect(onSelect: (status: PatientStatus) => void) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (status: PatientStatus) => {
      onSelect(status);
      setOpen(false);
    },
    [onSelect],
  );

  return {
    open,
    setOpen,
    handleSelect,
  };
}
