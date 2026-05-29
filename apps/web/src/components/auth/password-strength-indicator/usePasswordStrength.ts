import { useMemo } from "react";
import type { PasswordStrength } from "./types";

const STRENGTH_MAP = {
  0: { label: "Muito Fraca", color: "bg-destructive dark:bg-destructive/60" },
  1: { label: "Fraca", color: "bg-warning dark:bg-warning/60" },
  2: { label: "Média", color: "bg-warning dark:bg-warning/60" },
  3: { label: "Forte", color: "bg-success dark:bg-success/60" },
  4: { label: "Muito Forte", color: "bg-success dark:bg-success/60" },
};

function calculateRequirements(password: string) {
  return {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[@$!%*?&#]/.test(password),
  };
}

function calculateScore(
  requirements: ReturnType<typeof calculateRequirements>,
): number {
  const metCount = Object.values(requirements).filter(Boolean).length;

  if (metCount === 5) return 4;
  if (metCount >= 4) return 3;
  if (metCount >= 3) return 2;
  if (metCount >= 1) return 1;
  return 0;
}

export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    const requirements = calculateRequirements(password);
    let score = calculateScore(requirements);

    // Bonus por comprimento extra (15+ caracteres)
    if (
      password.length >= 15 &&
      Object.values(requirements).filter(Boolean).length >= 4
    ) {
      score = Math.min(4, score + 1);
    }

    const { label, color } = STRENGTH_MAP[score as keyof typeof STRENGTH_MAP];

    return { score, label, color, requirements };
  }, [password]);
}
