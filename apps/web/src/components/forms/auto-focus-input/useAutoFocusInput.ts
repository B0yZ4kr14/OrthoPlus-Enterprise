import { useRef, useEffect, KeyboardEvent } from "react";
import type { AutoFocusInputProps } from "./types";
import { getMaxDigits } from "./masks";

export function useAutoFocusInput(
  value: string,
  mask: AutoFocusInputProps["mask"],
  maxLength: number,
  nextInputRef?: React.RefObject<HTMLInputElement>,
  previousInputRef?: React.RefObject<HTMLInputElement>
) {
  const internalRef = useRef<HTMLInputElement>(null);

  // Auto-focus no próximo campo quando atingir maxLength
  useEffect(() => {
    const cleanValue = value.replace(/\D/g, "");
    const maxDigits = getMaxDigits(mask, maxLength);

    if (cleanValue.length === maxDigits && nextInputRef?.current) {
      nextInputRef.current.focus();
    }
  }, [value, mask, maxLength, nextInputRef]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && value.length === 0 && previousInputRef?.current) {
      e.preventDefault();
      previousInputRef.current.focus();
      const prevValue = previousInputRef.current.value;
      previousInputRef.current.setSelectionRange(prevValue.length, prevValue.length);
    }
  };

  return {
    internalRef,
    handleKeyDown,
  };
}
