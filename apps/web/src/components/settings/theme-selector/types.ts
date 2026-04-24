import type { ClinicalTheme, ClinicalThemeConfig } from "@/themes/clinical";

export type { ClinicalTheme, ClinicalThemeConfig };

export interface ThemeCardProps {
  themeKey: string;
  theme: ClinicalThemeConfig;
  isSelected: boolean;
}

export interface ColorPreviewProps {
  background: string;
  primary: string;
  odontograma: {
    higido: string;
    carie: string;
    tratado: string;
    implante: string;
  };
}
