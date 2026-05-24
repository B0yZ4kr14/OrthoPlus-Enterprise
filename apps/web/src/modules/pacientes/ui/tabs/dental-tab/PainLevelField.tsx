import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Slider } from "@orthoplus/core-ui/slider";
import type { DentalTabProps } from "./types";

export function PainLevelField({ form }: DentalTabProps) {
  return (
    <FormField
      control={form.control}
      name="pain_level"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nível de Dor (0-10)</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <Slider
                min={0}
                max={10}
                step={1}
                value={[field.value || 0]}
                onValueChange={(value) => field.onChange(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sem dor</span>
                <span className="font-bold">{field.value || 0}</span>
                <span>Dor máxima</span>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
