import { useState, useCallback } from "react";

export function useBitcoinInfoCard() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    toggle,
  };
}
