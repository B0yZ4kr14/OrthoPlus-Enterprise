import { Input } from "@orthoplus/core-ui/input";
import { useRef, useEffect, KeyboardEvent, forwardRef } from "react";

/**
 * FASE 0 - T0.4: AUTO-FOCUS INPUT
 * Campo de input que automaticamente foca no próximo campo quando atinge maxLength
 * e volta para o campo anterior ao pressionar Backspace em campo vazio
 */

interface AutoFocusInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxLength: number;
  nextInputRef?: React.RefObject<HTMLInputElement>;
  previousInputRef?: React.RefObject<HTMLInputElement>;
  value: string;
  onValueChange: (value: string) => void;
  mask?: "cpf" | "phone" | "cep" | "date" | "cnpj";
}

export const AutoFocusInput = forwardRef<HTMLInputElement, AutoFocusInputProps>(
  (
    {
      maxLength,
      nextInputRef,
      previousInputRef,
      value,
      onValueChange,
      mask,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    // Auto-focus no próximo campo quando atingir maxLength
    useEffect(() => {
      const cleanValue = value.replace(/\D/g, "");
      const maxDigits = getMaxDigits(mask);

      if (cleanValue.length === maxDigits && nextInputRef?.current) {
        nextInputRef.current.focus();
      }
    }, [value, mask, nextInputRef]);

    // Voltar para campo anterior ao pressionar Backspace em campo vazio
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === "Backspace" &&
        value.length === 0 &&
        previousInputRef?.current
      ) {
        e.preventDefault();
        previousInputRef.current.focus();
        // Move cursor para o final do campo anterior
        const prevValue = previousInputRef.current.value;
        previousInputRef.current.setSelectionRange(
          prevValue.length,
          prevValue.length,
        );
      }
    };

    // Aplicar máscara
    const applyMask = (rawValue: string): string => {
      const numbers = rawValue.replace(/\D/g, "");

      switch (mask) {
        case "cpf":
          return numbers
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

        case "cnpj":
          return numbers
            .replace(/(\d{2})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1/$2")
            .replace(/(\d{4})(\d{1,2})$/, "$1-$2");

        case "phone":
          if (numbers.length <= 10) {
            // Telefone fixo: (XX) XXXX-XXXX
            return numbers
              .replace(/(\d{2})(\d)/, "($1) $2")
              .replace(/(\d{4})(\d)/, "$1-$2");
          } else {
            // Celular: (XX) XXXXX-XXXX
            return numbers
              .replace(/(\d{2})(\d)/, "($1) $2")
              .replace(/(\d{5})(\d)/, "$1-$2");
          }

        case "cep":
          return numbers.replace(/(\d{5})(\d)/, "$1-$2");

        case "date":
          return numbers
            .replace(/(\d{2})(\d)/, "$1/$2")
            .replace(/(\d{2})(\d)/, "$1/$2");

        default:
          return rawValue;
      }
    };

    const getMaxDigits = (maskType?: string): number => {
      switch (maskType) {
        case "cpf":
          return 11;
        case "cnpj":
          return 14;
        case "phone":
          return 11;
        case "cep":
          return 8;
        case "date":
          return 8;
        default:
          return maxLength;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      onValueChange(rawValue);
    };

    const displayValue = mask ? applyMask(value) : value;

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
  },
);

AutoFocusInput.displayName = "AutoFocusInput";
