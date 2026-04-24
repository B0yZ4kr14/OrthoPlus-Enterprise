// cspell:disable
// @ts-expect-error — TS2305, TS2613
import type { Step } from "react-joyride";

export interface TourStep extends Step {
  target: string;
  content: React.ReactNode;
  placement?: string;
}
