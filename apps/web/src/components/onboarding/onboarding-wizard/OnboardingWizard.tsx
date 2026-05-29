// cspell:disable
import { useEffect } from "react";
import { Dialog, DialogContent } from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingWizard } from "./useOnboardingWizard";
import { WizardHeader } from "./WizardHeader";
import { WizardNavigation } from "./WizardNavigation";
import { CompletionScreen } from "./CompletionScreen";
import { STEPS } from "./constants";
import type { OnboardingWizardProps } from "./types";

export function OnboardingWizard({
  open = true,
  onClose,
  onComplete,
}: OnboardingWizardProps) {
  const {
    currentStep,
    completed,
    setStepStartTime,
    handleClose,
    handleNext,
    handlePrevious,
    handleFinish,
  } = useOnboardingWizard(onClose, onComplete);

  const step = STEPS[currentStep];
  const StepComponent = step.component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  useEffect(() => {
    if (open) {
      // track start event
    }
  }, [open]);

  if (completed) {
    return (
      <AnimatePresence>
        {open && (
          <CompletionScreen onClose={handleClose} onFinish={handleFinish} />
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 rounded-full h-10 w-10 bg-destructive/10 hover:bg-destructive/20 border-2 border-destructive/30"
              onClick={handleClose}
            >
              <X className="h-5 w-5 text-destructive" />
            </Button>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="relative p-6 space-y-6">
                <WizardHeader
                  steps={STEPS}
                  currentStep={currentStep}
                  progress={progress}
                />

                {/* Step Content */}
                <StepComponent />

                <WizardNavigation
                  currentStep={currentStep}
                  totalSteps={STEPS.length}
                  onPrevious={handlePrevious}
                  onNext={() => handleNext(STEPS.length, step.title)}
                />
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
