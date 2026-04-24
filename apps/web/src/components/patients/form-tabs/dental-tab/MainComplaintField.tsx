import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Textarea } from "@orthoplus/core-ui/textarea";
import type { DentalTabProps } from "./types";

export function MainComplaintField({ form }: DentalTabProps) {
  return (
    <FormField
      control={form.control}
      name="main_complaint"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Queixa Principal</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Descreva o motivo principal da consulta..."
              className="min-h-[100px]"
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
