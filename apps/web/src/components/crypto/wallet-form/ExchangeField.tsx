import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { ExchangeConfig } from "@/modules/crypto/types/crypto.types";
import type { UseFormReturn } from "react-hook-form";
import type { WalletFormData } from "./types";

interface ExchangeFieldProps {
  form: UseFormReturn<WalletFormData>;
  exchanges: ExchangeConfig[];
}

export function ExchangeField({ form, exchanges }: ExchangeFieldProps) {
  if (exchanges.length === 0) return null;

  return (
    <FormField
      control={form.control}
      name="exchange_config_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Exchange Vinculada (Opcional)</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value || undefined)}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma exchange" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">Nenhuma</SelectItem>
              {exchanges.map((exchange) => (
                <SelectItem
                  key={exchange.id || `exchange-${exchange.exchange_name}`}
                  value={exchange.id || ""}
                >
                  {exchange.exchange_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Vincular a uma exchange para sincronização automática
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
