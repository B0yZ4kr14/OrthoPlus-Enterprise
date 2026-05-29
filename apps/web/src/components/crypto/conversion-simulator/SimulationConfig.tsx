// cspell:disable
import { ArrowRightLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Button } from "@orthoplus/core-ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { CoinType } from "./types";

interface SimulationConfigProps {
  coinType: CoinType;
  amount: string;
  onCoinTypeChange: (value: CoinType) => void;
  onAmountChange: (value: string) => void;
  onRefresh: () => void;
}

export function SimulationConfig({
  coinType,
  amount,
  onCoinTypeChange,
  onAmountChange,
  onRefresh,
}: SimulationConfigProps) {
  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Simulador de Conversão Cripto → BRL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Criptomoeda</Label>
            <Select
              value={coinType}
              onValueChange={(value: CoinType) => onCoinTypeChange(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                <SelectItem value="USDT">Tether (USDT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantidade</Label>
            <Input
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="1.0"
            />
          </div>
        </div>

        <Button onClick={onRefresh} className="w-full">
          Atualizar Simulação
        </Button>
      </CardContent>
    </Card>
  );
}
