import { Input } from "@orthoplus/core-ui/input";
import { forwardRef, useRef } from "react";
import type { AutoFocusInputProps } from "./types";
import { applyMask } from "./masks";
import { useAutoFocusInput } from "./useAutoFocusInput";

export const AutoFocusInput = forwardRef<HTMLInputElement, AutoFocusInputProps>(
  (
    { maxLength, nextInputRef, previousInputRef, value, onValueChange, mask, ...props },
    ref
  ) => {
    const fallbackRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || fallbackRef;
    const { handleKeyDown } = useAutoFocusInput(value, mask, maxLength, nextInputRef, previousInputRef);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(e.target.value);
    };

    const displayValue = mask ? applyMask(value, mask) : value;

    return (
      <Input
        ref={inputRef}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        {...props}
      />
    );
  }
);

AutoFocusInput.displayName = "AutoFocusInput";
