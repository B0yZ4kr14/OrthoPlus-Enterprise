import { useState } from "react";
import { Button } from "@orthoplus/core-ui/button";
import { Form } from "@orthoplus/core-ui/form";
import type { WalletFormProps } from "./types";
import { useWalletForm } from "./useWalletForm";
import { WalletNameField } from "./WalletNameField";
import { CoinTypeField } from "./CoinTypeField";
import { WalletAddressField } from "./WalletAddressField";
import { ExchangeField } from "./ExchangeField";
import { ActiveSwitch } from "./ActiveSwitch";

export function WalletForm({
  onSubmit,
  onCancel,
  initialData,
  exchanges = [],
}: WalletFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useWalletForm(onSubmit, initialData);

  const handleFormSubmit = async (data: Parameters<typeof onSubmit>[0]) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <WalletNameField form={form} />
        <CoinTypeField form={form} />
        <WalletAddressField form={form} />
        <ExchangeField form={form} exchanges={exchanges} />
        <ActiveSwitch form={form} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Carteira"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
