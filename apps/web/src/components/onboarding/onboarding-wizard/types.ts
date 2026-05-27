// cspell:disable
import type { ComponentType, LazyExoticComponent } from "react";

export interface Step {
  id: string;
  title: string;
  description: string;
  component: ComponentType | LazyExoticComponent<ComponentType>;
}

export interface OnboardingWizardProps {
  open?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}
