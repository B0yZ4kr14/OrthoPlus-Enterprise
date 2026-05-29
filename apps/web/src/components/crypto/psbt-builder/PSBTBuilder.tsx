import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Shield } from "lucide-react";
import { usePSBTBuilder } from "./usePSBTBuilder";
import { PSBTForm } from "./PSBTForm";
import { PSBTResult } from "./PSBTResult";

export function PSBTBuilder() {
  const {
    recipient,
    amount,
    psbtBase64,
    copied,
    setRecipient,
    setAmount,
    generatePSBT,
    copyToClipboard,
  } = usePSBTBuilder();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Construtor PSBT (Offline Transaction)
        </CardTitle>
        <CardDescription>
          Crie transações Bitcoin parcialmente assinadas para assinatura offline
          com hardware wallets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <PSBTForm
          recipient={recipient}
          amount={amount}
          onRecipientChange={setRecipient}
          onAmountChange={setAmount}
          onGenerate={generatePSBT}
        />

        {psbtBase64 && (
          <PSBTResult
            psbtBase64={psbtBase64}
            copied={copied}
            onCopy={copyToClipboard}
          />
        )}
      </CardContent>
    </Card>
  );
}
