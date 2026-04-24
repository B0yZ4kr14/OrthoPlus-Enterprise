// cspell:disable
import type { ComponentType } from "react";

export interface Step {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
}

export interface OnboardingWizardProps {
  open?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}
