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

interface WalletAddressFieldProps {
  form: UseFormReturn<WalletFormData>;
}

export function WalletAddressField({ form }: WalletAddressFieldProps) {
  return (
    <FormField
      control={form.control}
      name="wallet_address"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Endereço da Carteira</FormLabel>
          <FormControl>
            <Input
              placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
              {...field}
              className="font-mono text-sm"
            />
          </FormControl>
          <FormDescription>
            Endereço público da carteira para receber pagamentos
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
