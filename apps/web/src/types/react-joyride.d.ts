/**
 * Type declarations for react-joyride
 * Package does not ship types; these cover all usage in the codebase.
 */

declare module "react-joyride" {
  import type { ReactNode, CSSProperties } from "react";

  export interface Step {
    target: string | HTMLElement;
    content?: ReactNode;
    title?: ReactNode;
    disableBeacon?: boolean;
    disableOverlay?: boolean;
    disableOverlayClose?: boolean;
    disableScrolling?: boolean;
    skipBeacon?: boolean;
    event?: string;
    isFixed?: boolean;
    offset?: number;
    placement?: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end" | "center" | "auto";
    placementBeacon?: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end";
    showSkipButton?: boolean;
    spotlightClicks?: boolean;
    spotlightPadding?: number;
    styles?: {
      options?: {
        arrowColor?: string;
        backgroundColor?: string;
        beaconSize?: number;
        overlayColor?: string;
        primaryColor?: string;
        spotlightShadow?: string;
        textColor?: string;
        width?: number | string;
        zIndex?: number;
        showProgress?: boolean;
        overlayClickAction?: boolean | string;
      };
      arrow?: CSSProperties;
      beacon?: CSSProperties;
      beaconInner?: CSSProperties;
      beaconOuter?: CSSProperties;
      buttonBack?: CSSProperties;
      buttonClose?: CSSProperties;
      buttonNext?: CSSProperties;
      buttonPrimary?: CSSProperties;
      buttonSkip?: CSSProperties;
      overlay?: CSSProperties;
      spotlight?: CSSProperties;
      tooltip?: CSSProperties;
      tooltipContainer?: CSSProperties;
      tooltipContent?: CSSProperties;
      tooltipFooter?: CSSProperties;
      tooltipFooterSpacer?: CSSProperties;
      tooltipTitle?: CSSProperties;
    };
    tooltipComponent?: ReactNode;
  }

  export interface CallBackProps {
    action: string;
    controlled: boolean;
    index: number;
    lifecycle: string;
    size: number;
    status: string;
    step: Step;
    type: string;
  }

  export interface EventData {
    action: string;
    index: number;
    lifecycle: string;
    size: number;
    status: string;
    step: Step;
    type: string;
  }

  export const STATUS: {
    IDLE: string;
    READY: string;
    RUNNING: string;
    PAUSED: string;
    SKIPPED: string;
    FINISHED: string;
    ERROR: string;
  };

  export interface JoyrideProps {
    steps: Step[];
    run?: boolean;
    continuous?: boolean;
    showProgress?: boolean;
    showSkipButton?: boolean;
    disableCloseOnEsc?: boolean;
    disableOverlay?: boolean;
    disableOverlayClose?: boolean;
    disableScrolling?: boolean;
    hideBackButton?: boolean;
    spotlightClicks?: boolean;
    spotlightPadding?: number;
    styles?: Step["styles"];
    callback?: (data: CallBackProps) => void;
    onEvent?: (data: EventData) => void;
    options?: Step["styles"]["options"];
    getHelpers?: (helpers: {
      close: () => void;
      go: (index: number) => void;
      info: () => void;
      next: () => void;
      open: () => void;
      prev: () => void;
      reset: (restart: boolean) => void;
      skip: () => void;
    }) => void;
    locale?: {
      back?: string;
      close?: string;
      last?: string;
      next?: string;
      open?: string;
      skip?: string;
    };
    scrollOffset?: number;
    scrollToFirstStep?: boolean;
    stepIndex?: number;
    tooltipComponent?: ReactNode;
    floaterProps?: Record<string, unknown>;
    debug?: boolean;
  }

  export default function Joyride(props: JoyrideProps): JSX.Element;
  export function Joyride(props: JoyrideProps): JSX.Element;
}
