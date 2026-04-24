// cspell:disable
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import { UseFormReturn } from "react-hook-form";
import type { PatientFormValues } from "@/lib/patient-validation";

interface ContactSectionProps {
  form: UseFormReturn<PatientFormValues>;
  onPhoneChange: (value: string) => string;
}

export function ContactSection({ form, onPhoneChange }: ContactSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Contato</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_primary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone Principal *</FormLabel>
              <FormControl>
                <Input
                  placeholder="(00) 00000-0000"
                  {...field}
                  onChange={(e) => field.onChange(onPhoneChange(e.target.value))}
                  maxLength={15}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_secondary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone Secundário</FormLabel>
              <FormControl>
                <Input
                  placeholder="(00) 00000-0000"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(onPhoneChange(e.target.value))}
                  maxLength={15}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_emergency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone de Emergência</FormLabel>
              <FormControl>
                <Input
                  placeholder="(00) 00000-0000"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(onPhoneChange(e.target.value))}
                  maxLength={15}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergency_contact_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Contato de Emergência</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergency_contact_relationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parentesco do Contato</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Mãe, Pai, Cônjuge" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
