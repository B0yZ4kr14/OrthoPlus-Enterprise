// cspell:disable
type Step = any;

export interface TourStep extends Step {
  target: string;
  content: React.ReactNode;
  placement?: string;
}
