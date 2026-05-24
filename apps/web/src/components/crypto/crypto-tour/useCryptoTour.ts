import { useEffect, useState, useCallback } from "react";
import type { CallBackProps, STATUS } from "react-joyride";

export function useCryptoTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("crypto-tour-completed");
    if (!hasSeenTour) {
      setTimeout(() => setRun(true), 1000);
    }
  }, []);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ["finished", "skipped"];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("crypto-tour-completed", "true");
    }
  }, []);

  return {
    run,
    handleJoyrideCallback,
  };
}
