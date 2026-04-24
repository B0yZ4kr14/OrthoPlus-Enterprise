export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
}

export interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  minimal?: boolean;
}
