import { useState, useCallback } from "react";
import {
  applyClinicalTheme,
  getClinicalTheme,
} from "@/themes/clinical";
import type { ClinicalTheme } from "../types";

export function useThemeSelector() {
  const [selectedTheme, setSelectedTheme] =
    useState<ClinicalTheme>(getClinicalTheme());

  const handleThemeChange = useCallback((theme: ClinicalTheme) => {
    setSelectedTheme(theme);
    applyClinicalTheme(theme);
  }, []);

  return {
    selectedTheme,
    handleThemeChange,
  };
}
