import Joyride, { Step } from "react-joyride";
import { useCryptoTour } from "./useCryptoTour";
import { WelcomeContent, StepContent } from "./TourContent";
import { TOUR_STEPS, JOYRIDE_STYLES, JOYRIDE_LOCALE } from "./types";

export function CryptoTour() {
  const { run, handleJoyrideCallback } = useCryptoTour();

  const steps: Step[] = TOUR_STEPS.map((step, index) => ({
    target: step.target,
    content: index === 0 ? <WelcomeContent /> : <StepContent step={step} />,
    placement: step.placement || "bottom",
    disableBeacon: index > 0,
  }));

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={JOYRIDE_STYLES}
      locale={JOYRIDE_LOCALE}
    />
  );
}
