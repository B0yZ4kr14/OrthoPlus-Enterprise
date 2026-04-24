// cspell:disable
import { useState, useEffect } from "react";
import type { EventData } from "react-joyride";
import { STATUS } from "react-joyride";
import { useAuth } from "@/contexts/AuthContext";
import { TOUR_COMPLETED_KEY } from "./constants";

export function useProductTour() {
  const [run, setRun] = useState(false);
  const { user } = useAuth();

  const isAutomatedBrowser =
    typeof window !== "undefined" && window.navigator.webdriver;

  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);

    if (!tourCompleted && user) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    }
  };

  const restartTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    setRun(true);
  };

  useEffect(() => {
    (window as unknown as Record<string, unknown>).startOrthoTour = restartTour;
  }, []);

  return {
    run,
    handleJoyrideCallback,
    restartTour,
    isAutomatedBrowser,
  };
}
