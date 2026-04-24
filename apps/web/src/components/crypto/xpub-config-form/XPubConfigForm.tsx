// cspell:disable
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@orthoplus/core-ui/card";
import { Form } from "@orthoplus/core-ui/form";
import { useXPubConfig } from "./useXPubConfig";
import { FormFields } from "./FormFields";
import { TestSection } from "./TestSection";
import { FormActions } from "./FormActions";
import type { XPubConfigFormProps } from "./schema";

export function XPubConfigForm({ onSuccess, onCancel }: XPubConfigFormProps) {
  const { form, testingXPub, testAddress, isValid, handleTestXPub, onSubmit } = useXPubConfig({
    onSuccess,
    onCancel,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Hardware Wallet (Não-Custodial)</CardTitle>
        <CardDescription>
          O Ortho+ <strong>NUNCA</strong> terá acesso às suas chaves privadas. Configure sua Hardware Wallet (Trezor,
          Coldcard, KRUX) para gerar endereços de recebimento.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormFields form={form} />
            <TestSection
              testing={testingXPub}
              testAddress={testAddress}
              hasXpub={!!form.watch("xpub")}
              onTest={handleTestXPub}
            />
            <FormActions isValid={isValid} onCancel={onCancel} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
