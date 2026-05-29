// cspell:disable
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@orthoplus/core-ui/card";
import { KeyRound } from "lucide-react";

export function AuthCardHeader() {
  return (
    <CardHeader>
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5" />
        <CardTitle>Configurações de Autenticação</CardTitle>
      </div>
      <CardDescription>
        Configure métodos de login e requisitos de senha
      </CardDescription>
    </CardHeader>
  );
}
