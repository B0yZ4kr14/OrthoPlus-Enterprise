// cspell:disable
import { Calculator } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import type { ConfigPanelProps } from "./types";
import { CoinTypeSelect } from "./components/CoinTypeSelect";
import { MonthlyAmountInput } from "./components/MonthlyAmountInput";
import { PeriodSelect } from "./components/PeriodSelect";
import { RunButton } from "./components/RunButton";

export * from "./types";
export { CoinTypeSelect, MonthlyAmountInput, PeriodSelect, RunButton };

export function ConfigPanel({
  coinType,
  monthlyAmount,
  period,
  loading,
  onCoinTypeChange,
  onMonthlyAmountChange,
  onPeriodChange,
  onRunBacktest,
}: ConfigPanelProps) {
  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Backtesting DCA vs Investimento Único
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CoinTypeSelect value={coinType} onChange={onCoinTypeChange} />
          <MonthlyAmountInput
            value={monthlyAmount}
            onChange={onMonthlyAmountChange}
          />
          <PeriodSelect value={period} onChange={onPeriodChange} />
          <RunButton loading={loading} onClick={onRunBacktest} />
        </div>
      </CardContent>
    </Card>
  );
}
