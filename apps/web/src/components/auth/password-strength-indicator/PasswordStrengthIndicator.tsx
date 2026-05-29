import type { PasswordStrengthIndicatorProps } from "./types";
import { usePasswordStrength } from "./usePasswordStrength";
import { StrengthBar } from "./StrengthBar";
import { StrengthLabel } from "./StrengthLabel";
import { RequirementsList } from "./RequirementsList";
import { SecurityTip } from "./SecurityTip";

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
  minimal = false,
}: PasswordStrengthIndicatorProps) {
  const strength = usePasswordStrength(password);

  if (minimal) {
    return (
      <StrengthBar score={strength.score} color={strength.color} minimal />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <StrengthBar score={strength.score} color={strength.color} />
        <StrengthLabel
          password={password}
          label={strength.label}
          color={strength.color}
          score={strength.score}
        />
      </div>

      {showRequirements && password.length > 0 && (
        <RequirementsList requirements={strength.requirements} />
      )}

      {password.length > 0 && strength.score < 4 && <SecurityTip />}
    </div>
  );
}
