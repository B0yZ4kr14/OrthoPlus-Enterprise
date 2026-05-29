import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import { Target, Megaphone, Calendar, User, Phone } from "lucide-react";
import type { MarketingTrackingTabProps } from "./types";
import type { MarketingField } from "./types";

const ICONS = {
  target: Target,
  megaphone: Megaphone,
  calendar: Calendar,
  user: User,
  phone: Phone,
};

interface MarketingFieldProps extends MarketingTrackingTabProps {
  field: MarketingField;
}

export function MarketingField({ form, field }: MarketingFieldProps) {
  const Icon = ICONS[field.icon];

  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {field.label}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={field.placeholder}
              {...formField}
              value={String(formField.value || "")}
            />
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
