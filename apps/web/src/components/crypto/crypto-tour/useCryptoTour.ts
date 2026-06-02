import { useEffect, useState, useCallback } from "react";
import type { CallBackProps } from "react-joyride";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

export function useCryptoTour() {
  const [hasSeenTour, setHasSeenTour] = useLocalStorage<boolean>(
    "crypto-tour-completed",
    false,
  );
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!hasSeenTour) {
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status } = data;
      const finishedStatuses: string[] = ["finished", "skipped"];

      if (finishedStatuses.includes(status)) {
        setRun(false);
        setHasSeenTour(true);
      }
    },
    [setHasSeenTour],
  );

  return {
    run,
    handleJoyrideCallback,
  };
}
