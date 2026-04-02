import { useEffect, useRef } from "react";

interface UseFocusTrapOptions {
  enabled?: boolean;
  restoreFocus?: boolean;
}

/**
 * Hook para gerenciar focus trap em modais/dialogs para acessibilidade
 * Segue padrão WCAG 2.1 para navegação por teclado
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {},
) {
  const { enabled = true, restoreFocus = true } = options;
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Selecionar elementos focáveis
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector),
      );
    };

    // Focar primeiro elemento ao abrir
    const focusFirstElement = () => {
      const elements = getFocusableElements();
      if (elements.length > 0) {
        elements[0].focus();
      }
    };

    // Trap de foco
    const handleTabKey = (e: KeyboardEvent) => {
      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (e.key === "Tab") {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }

      // ESC para fechar
      if (e.key === "Escape") {
        if (restoreFocus && previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      }
    };

    focusFirstElement();
    container.addEventListener("keydown", handleTabKey);

    return () => {
      container.removeEventListener("keydown", handleTabKey);
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [enabled, restoreFocus]);

  return containerRef;
}
