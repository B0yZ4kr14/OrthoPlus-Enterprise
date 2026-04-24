// cspell:disable
import { X } from "lucide-react";
import { FormLabel } from "@orthoplus/core-ui/form";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { AVAILABLE_COINS } from "./types";

interface CoinSelectorProps {
  selectedCoins: string[];
  onAddCoin: (coin: string) => void;
  onRemoveCoin: (coin: string) => void;
}

export function CoinSelector({ selectedCoins, onAddCoin, onRemoveCoin }: CoinSelectorProps) {
  const availableCoins = AVAILABLE_COINS.filter((coin) => !selectedCoins.includes(coin));

  return (
    <div className="space-y-3">
      <FormLabel>Moedas Suportadas</FormLabel>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedCoins.map((coin) => (
          <Badge key={coin} variant="default" className="gap-1">
            {coin}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => onRemoveCoin(coin)}
            />
          </Badge>
        ))}
      </div>
      <Select onValueChange={onAddCoin}>
        <SelectTrigger>
          <SelectValue placeholder="Adicionar moeda" />
        </SelectTrigger>
        <SelectContent>
          {availableCoins.map((coin) => (
            <SelectItem key={coin} value={coin}>
              {coin}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
