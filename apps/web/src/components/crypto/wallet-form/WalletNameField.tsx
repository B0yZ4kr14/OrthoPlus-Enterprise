import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { WalletFormData } from "./types";

interface WalletNameFieldProps {
  form: UseFormReturn<WalletFormData>;
}

export function WalletNameField({ form }: WalletNameFieldProps) {
  return (
    <FormField
      control={form.control}
      name="wallet_name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome da Carteira</FormLabel>
          <FormControl>
            <Input placeholder="Carteira Principal BTC" {...field} />
          </FormControl>
          <FormDescription>
            Nome descritivo para identificar esta carteira
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
