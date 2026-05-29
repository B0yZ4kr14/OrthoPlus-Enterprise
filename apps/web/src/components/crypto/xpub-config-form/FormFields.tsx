// cspell:disable
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import { Textarea } from "@orthoplus/core-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { UseFormReturn } from "react-hook-form";
import type { XPubConfigFormValues } from "./schema";

interface FormFieldsProps {
  form: UseFormReturn<XPubConfigFormValues>;
}

export function FormFields({ form }: FormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="wallet_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da Wallet</FormLabel>
            <FormControl>
              <Input placeholder="Trezor Principal" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hardware_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Hardware Wallet</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="trezor">Trezor</SelectItem>
                <SelectItem value="coldcard">Coldcard</SelectItem>
                <SelectItem value="krux">KRUX (DIY)</SelectItem>
                <SelectItem value="ledger">Ledger</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="xpub"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Extended Public Key (xPub/yPub/zPub)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKp5KUMRmD9YgoWDbEVpLFgje71pRAVBPX6DCmV9HNTLr8GHqKZANvNcFpSZe3kiKsH5Ej7ApG1NVDK"
                rows={3}
                className="font-mono text-xs"
                {...field}
              />
            </FormControl>
            <FormDescription>
              ⚠️ Exporte APENAS a xPub da sua wallet. NUNCA a chave privada
              (seed).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="derivation_path"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Derivation Path</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="m/84'/0'/0'/0">
                  BIP84 (bc1...) - SegWit Native
                </SelectItem>
                <SelectItem value="m/49'/0'/0'/0">
                  BIP49 (3...) - SegWit Wrapped
                </SelectItem>
                <SelectItem value="m/44'/0'/0'/0">
                  BIP44 (1...) - Legacy
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Recomendado: BIP84 (endereços bc1... - menores taxas)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notas (Opcional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Wallet para recebimentos de implantes"
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
