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
import { coinLabels } from "@/modules/crypto/types/crypto.types";
import type { UseFormReturn } from "react-hook-form";
import type { WalletFormData } from "./types";

interface CoinTypeFieldProps {
  form: UseFormReturn<WalletFormData>;
}

export function CoinTypeField({ form }: CoinTypeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="coin_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de Moeda</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a moeda" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(coinLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label} ({key})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Tipo de criptomoeda desta carteira
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
