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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@orthoplus/core-ui/tooltip";
import { exchangeLabels } from "@/modules/crypto/types/crypto.types";
import type { UseFormReturn } from "react-hook-form";
import type { ExchangeFormValues } from "./types";

interface ExchangeSelectFieldProps {
  form: UseFormReturn<ExchangeFormValues>;
}

export function ExchangeSelectField({ form }: ExchangeSelectFieldProps) {
  return (
    <FormField
      control={form.control}
      name="exchange_name"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Exchange *</FormLabel>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Selecione a corretora de criptomoedas que você deseja
                  integrar. Binance e Coinbase são as mais populares.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma exchange" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(exchangeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Escolha a exchange que será integrada
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
