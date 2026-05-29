import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import { Button } from "@orthoplus/core-ui/button";
import { Search } from "lucide-react";
import type { AddressSectionProps } from "./types";

export function CEPField({
  form,
  loadingCEP,
  onCEPChange,
  onSearchCEP,
}: AddressSectionProps) {
  return (
    <FormField
      control={form.control}
      name="address_zipcode"
      render={({ field }) => (
        <FormItem>
          <FormLabel>CEP</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <Input
                placeholder="00000-000"
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(onCEPChange(e.target.value))}
                maxLength={9}
              />
            </FormControl>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onSearchCEP}
              disabled={loadingCEP}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
