import { useEffect } from "react";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;

export function useFontSize() {
  const [fontSize, setFontSize] = useLocalStorage<number>(
    "ortho-font-size",
    DEFAULT_FONT_SIZE,
  );

  useEffect(() => {
    // Clamp fontSize between min and max
    const clampedSize = Math.min(
      Math.max(fontSize, MIN_FONT_SIZE),
      MAX_FONT_SIZE,
    );

    // Apply to root element
    document.documentElement.style.setProperty(
      "--base-font-size",
      `${clampedSize}px`,
    );
  }, [fontSize]);

  const setSize = (size: number) => {
    const clampedSize = Math.min(Math.max(size, MIN_FONT_SIZE), MAX_FONT_SIZE);
    setFontSize(clampedSize);
  };

  const resetSize = () => {
    setFontSize(DEFAULT_FONT_SIZE);
  };

  return {
    fontSize,
    setFontSize: setSize,
    resetSize,
    min: MIN_FONT_SIZE,
    max: MAX_FONT_SIZE,
    default: DEFAULT_FONT_SIZE,
  };
}
