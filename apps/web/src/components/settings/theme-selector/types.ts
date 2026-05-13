import type { ClinicalTheme } from "@/themes/clinical";

export type { ClinicalTheme };

export interface ThemeCardProps {
  themeKey: string;
  theme: any;
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
