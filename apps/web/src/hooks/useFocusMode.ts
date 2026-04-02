import { useState, useEffect, useCallback } from "react";

interface FocusModeOptions {
  enabled?: boolean;
  timeout?: number; // Tempo em ms antes de desativar o modo foco após parar de digitar
}

export const useFocusMode = (options: FocusModeOptions = {}) => {
  const { enabled = true, timeout = 3000 } = options;
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const handleInputActivity = useCallback(() => {
    if (!enabled) return;

    setIsFocusMode(true);
    setLastActivity(Date.now());
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsFocusMode(false);
      return;
    }

    // Detectar foco em inputs, textareas e elementos editáveis
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true" ||
        target.getAttribute("role") === "textbox"
      ) {
        handleInputActivity();
      }
    };

    // Detectar digitação
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        handleInputActivity();
      }
    };

    // Detectar cliques fora de campos de input
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInputRelated =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true" ||
        target.closest('input, textarea, [contenteditable="true"]');

      if (!isInputRelated && isFocusMode) {
        setIsFocusMode(false);
      }
    };

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClick);
    };
  }, [enabled, handleInputActivity, isFocusMode]);

  // Timer para desativar modo foco após inatividade
  useEffect(() => {
    if (!isFocusMode || !enabled) return;

    const timer = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity >= timeout) {
        setIsFocusMode(false);
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [isFocusMode, lastActivity, timeout, enabled]);

  const enableFocusMode = useCallback(() => {
    setIsFocusMode(true);
  }, []);

  const disableFocusMode = useCallback(() => {
    setIsFocusMode(false);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, []);

  return {
    isFocusMode,
    enableFocusMode,
    disableFocusMode,
    toggleFocusMode,
  };
};
