import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { UseFormReturn } from "react-hook-form";
import type { LeadFormData } from "./types";

interface UTMSectionProps {
  form: UseFormReturn<LeadFormData>;
}

export function UTMSection({ form }: UTMSectionProps) {
  const { register } = form;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="utm_source">UTM Source</Label>
        <Input id="utm_source" {...register("utm_source")} placeholder="Ex: google" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="utm_medium">UTM Medium</Label>
        <Input id="utm_medium" {...register("utm_medium")} placeholder="Ex: cpc" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="utm_campaign">UTM Campaign</Label>
        <Input id="utm_campaign" {...register("utm_campaign")} placeholder="Ex: ortodontia-2024" />
      </div>
    </>
  );
}
