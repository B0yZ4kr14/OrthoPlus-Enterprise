import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@orthoplus/core-ui/form";
import { Switch } from "@orthoplus/core-ui/switch";
import type { UseFormReturn } from "react-hook-form";
import type { WalletFormData } from "./types";

interface ActiveSwitchProps {
  form: UseFormReturn<WalletFormData>;
}

export function ActiveSwitch({ form }: ActiveSwitchProps) {
  return (
    <FormField
      control={form.control}
      name="is_active"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Carteira Ativa</FormLabel>
            <FormDescription>
              Ativar esta carteira para receber pagamentos
            </FormDescription>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
