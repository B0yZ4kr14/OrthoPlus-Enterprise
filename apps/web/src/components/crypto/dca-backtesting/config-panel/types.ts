import type { CoinType } from "../types";

export type { CoinType };

export interface ConfigPanelProps {
  coinType: CoinType;
  monthlyAmount: number;
  period: number;
  loading: boolean;
  onCoinTypeChange: (value: CoinType) => void;
  onMonthlyAmountChange: (value: number) => void;
  onPeriodChange: (value: number) => void;
  onRunBacktest: () => void;
}
