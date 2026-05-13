// cspell:disable
import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

export function useOnboardingWizard(
  onClose?: () => void,
  onComplete?: () => void
) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const stepStartTimeRef = useRef<number>(Date.now());
  const navigate = useNavigate();

  const trackEvent = useCallback(
    async (eventType: string, stepNumber?: number, stepName?: string) => {
      const timeSpent = Math.floor((Date.now() - stepStartTimeRef.current) / 1000);

      try {
        await apiClient.post("/analytics/processor", {
          event_type: eventType,
          step_number: stepNumber,
          step_name: stepName,
          time_spent_seconds: timeSpent,
          metadata: { timestamp: new Date().toISOString() },
        });
      } catch (error) {
        logger.error("Error tracking analytics:", error);
      }
    },
    []
  );

  const handleClose = useCallback(() => {
    // Note: step info would need to be passed in or stored in state
    trackEvent("abandoned", currentStep + 1, `Step ${currentStep + 1}`);
    onClose?.();
  }, [currentStep, onClose, trackEvent]);

  const handleNext = useCallback(
    (totalSteps: number, stepTitle: string) => {
      trackEvent("step_completed", currentStep + 1, stepTitle);

      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
        stepStartTimeRef.current = Date.now();
        toast.success(`Avançando para: Step ${currentStep + 2}`);
      } else {
        setCompleted(true);
        trackEvent("completed");
        toast.success("🎉 Onboarding concluído com sucesso!");
      }
    },
    [currentStep, trackEvent]
  );

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleFinish = useCallback(() => {
    onComplete?.();
    handleClose();
    navigate("/dashboard");
  }, [onComplete, handleClose, navigate]);

  return {
    currentStep,
    completed,
    stepStartTime: stepStartTimeRef.current,
    setCurrentStep,
    setCompleted,
    setStepStartTime: () => {},
    handleClose,
    handleNext,
    handlePrevious,
    handleFinish,
  };
}
