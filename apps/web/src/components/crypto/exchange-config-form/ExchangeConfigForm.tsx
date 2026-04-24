// cspell:disable
import { Form } from "@orthoplus/core-ui/form";
import { TooltipProvider } from "@orthoplus/core-ui/tooltip";
import { useExchangeConfigForm } from "./useExchangeConfigForm";
import { ConnectionAlert } from "./ConnectionAlert";
import { ExchangeSelectField } from "./ExchangeSelectField";
import { ApiKeyFields } from "./ApiKeyFields";
import { TestConnectionButton } from "./TestConnectionButton";
import { WalletAddressField } from "./WalletAddressField";
import { CoinSelector } from "./CoinSelector";
import { AdvancedSettings } from "./AdvancedSettings";
import { FormActions } from "./FormActions";
import type { ExchangeConfig } from "@/modules/crypto/types/crypto.types";
import type { ExchangeFormValues } from "./types";

interface ExchangeConfigFormProps {
  onSubmit: (data: ExchangeFormValues) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ExchangeConfig>;
}

export function ExchangeConfigForm({
  onSubmit,
  onCancel,
  initialData,
}: ExchangeConfigFormProps) {
  const {
    form,
    testingConnection,
    connectionStatus,
    selectedCoins,
    handleTestConnection,
    handleAddCoin,
    handleRemoveCoin,
    handleSubmit,
  } = useExchangeConfigForm({ onSubmit, initialData });

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <ConnectionAlert status={connectionStatus} />
          
          <ExchangeSelectField form={form} />
          <ApiKeyFields form={form} />
          
          <TestConnectionButton
            onClick={handleTestConnection}
            isTesting={testingConnection}
          />
          
          <WalletAddressField form={form} />
          
          <CoinSelector
            selectedCoins={selectedCoins}
            onAddCoin={handleAddCoin}
            onRemoveCoin={handleRemoveCoin}
          />
          
          <AdvancedSettings form={form} />
          
          <FormActions onCancel={onCancel} isSubmitting={testingConnection} />
        </form>
      </Form>
    </TooltipProvider>
  );
}
