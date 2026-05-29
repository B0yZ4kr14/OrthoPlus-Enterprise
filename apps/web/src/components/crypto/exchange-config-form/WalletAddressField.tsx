// cspell:disable
import { HelpCircle } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@orthoplus/core-ui/tooltip";
import type { UseFormReturn } from "react-hook-form";
import type { ExchangeFormValues } from "./types";

interface WalletAddressFieldProps {
  form: UseFormReturn<ExchangeFormValues>;
}

export function WalletAddressField({ form }: WalletAddressFieldProps) {
  return (
    <FormField
      control={form.control}
      name="wallet_address"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Endereço da Carteira Principal (Opcional)</FormLabel>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Endereço da sua carteira principal na exchange para receber
                  pagamentos diretos. Você pode deixar em branco e criar
                  carteiras específicas depois.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <FormControl>
            <Input
              placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
              {...field}
              className="font-mono text-sm"
            />
          </FormControl>
          <FormDescription>
            Endereço da carteira para recebimentos diretos
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
