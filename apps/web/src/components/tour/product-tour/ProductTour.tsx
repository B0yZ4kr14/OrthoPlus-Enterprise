// cspell:disable
// @ts-expect-error — TS2305, TS2613
import Joyride from "react-joyride";
import { useProductTour } from "./useProductTour";
import { tourSteps } from "./TourSteps";
import { TOUR_STYLES, TOUR_LOCALE } from "./constants";

export function ProductTour() {
  const { run, handleJoyrideCallback, isAutomatedBrowser } = useProductTour();

  if (isAutomatedBrowser) {
    return null;
  }

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      scrollOffset={100}
      disableOverlayClose={false}
      callback={handleJoyrideCallback}
      styles={TOUR_STYLES}
      locale={TOUR_LOCALE}
    />
  );
}
