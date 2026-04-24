import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { CreditCard, QrCode, Bitcoin } from "lucide-react";
import type { PaymentMethod } from "./types";
import { PixPaymentForm } from "./PixPaymentForm";
import { CardPaymentForm } from "./CardPaymentForm";

interface PaymentMethodTabsProps {
  metodo: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  pixKey: string;
  onPixKeyChange: (value: string) => void;
  cardFields: {
    number: string;
    holder: string;
    expiry: string;
    cvv: string;
  };
  onCardFieldChange: (field: keyof CardPaymentForm["cardFields"], value: string) => void;
  onCardTypeChange: (type: PaymentMethod) => void;
}

export function PaymentMethodTabs({
  metodo,
  onMethodChange,
  pixKey,
  onPixKeyChange,
  cardFields,
  onCardFieldChange,
  onCardTypeChange,
}: PaymentMethodTabsProps) {
  return (
    <Tabs value={metodo} onValueChange={(v) => onMethodChange(v as PaymentMethod)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="PIX" className="gap-2">
          <QrCode className="h-4 w-4" />
          PIX
        </TabsTrigger>
        <TabsTrigger value="CARTAO_CREDITO" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Cartão
        </TabsTrigger>
        <TabsTrigger value="CRYPTO" className="gap-2">
          <Bitcoin className="h-4 w-4" />
          Crypto
        </TabsTrigger>
      </TabsList>

      <TabsContent value="PIX" className="space-y-4 mt-4">
        <PixPaymentForm pixKey={pixKey} onChange={onPixKeyChange} />
      </TabsContent>

      <TabsContent value="CARTAO_CREDITO" className="space-y-4 mt-4">
        <CardPaymentForm
          fields={cardFields}
          onFieldChange={onCardFieldChange}
          metodo={metodo}
          onTypeChange={onCardTypeChange}
        />
      </TabsContent>

      <TabsContent value="CARTAO_DEBITO" className="space-y-4 mt-4">
        <CardPaymentForm
          fields={cardFields}
          onFieldChange={onCardFieldChange}
          metodo={metodo}
          onTypeChange={onCardTypeChange}
        />
      </TabsContent>
    </Tabs>
  );
}
