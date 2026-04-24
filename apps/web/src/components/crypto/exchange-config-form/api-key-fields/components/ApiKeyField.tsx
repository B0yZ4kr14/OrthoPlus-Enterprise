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
import type { ApiKeyFieldProps } from "../types";

export function ApiKeyField({
  form,
  name,
  label,
  placeholder,
  description,
  tooltipContent,
}: ApiKeyFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>{label} *</FormLabel>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p dangerouslySetInnerHTML={{ __html: tooltipContent }} />
              </TooltipContent>
            </Tooltip>
          </div>
          <FormControl>
            <Input
              placeholder={placeholder}
              type="password"
              {...field}
              className="font-mono"
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
