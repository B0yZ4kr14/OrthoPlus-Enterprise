import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@orthoplus/core-ui/card";
import { Shield } from "lucide-react";

export function KruxHeader() {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Integração Krux Hardware Wallet
      </CardTitle>
      <CardDescription>
        Assine transações offline com seu Krux DIY e faça broadcast após
        validação
      </CardDescription>
    </CardHeader>
  );
}
