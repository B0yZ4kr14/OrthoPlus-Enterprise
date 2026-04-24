// cspell:disable
import type { AdvancedSettingsProps } from "./types";
import { FormSwitch } from "./components/FormSwitch";
import { FormNumberInput } from "./components/FormNumberInput";

export * from "./types";
export { FormSwitch, FormNumberInput };

export function AdvancedSettings({ form }: AdvancedSettingsProps) {
  const autoConvert = form.watch("auto_convert_to_brl");

  return (
    <>
      <FormSwitch
        form={form}
        name="auto_convert_to_brl"
        label="Conversão Automática para BRL"
        description="Converter automaticamente quando receber pagamentos"
      />

      {autoConvert && (
        <FormNumberInput
          form={form}
          name="conversion_threshold"
          label="Valor Mínimo para Conversão (BRL)"
          description="Converter apenas valores acima deste montante"
          placeholder="0.00"
        />
      )}

      <FormNumberInput
        form={form}
        name="processing_fee_percentage"
        label="Taxa de Processamento (%)"
        description="Percentual cobrado pela clínica em cada transação (0-100%)"
        min={0}
        max={100}
        placeholder="Ex: 2.5"
      />

      <FormSwitch
        form={form}
        name="is_active"
        label="Exchange Ativa"
        description="Ativar esta exchange para receber pagamentos"
      />
    </>
  );
}
