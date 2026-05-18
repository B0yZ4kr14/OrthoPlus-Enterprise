import { Card } from "@orthoplus/core-ui/card";
import { AlertCircle } from "lucide-react";

export function ExamplesCard() {
  return (
    <Card className="p-6 bg-warning/10 border-warning/20">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-warning" />
        Exemplos Práticos
      </h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>
          ✅ <strong>Pode:</strong> Desativar "Split de Pagamento" a qualquer
          momento
        </li>
        <li>
          ❌ <strong>Não pode:</strong> Desativar "Financeiro" se "Split de
          Pagamento" estiver ativo
        </li>
        <li>
          ✅ <strong>Pode:</strong> Ativar "Split de Pagamento" se
          "Financeiro" já estiver ativo
        </li>
        <li>
          ❌ <strong>Não pode:</strong> Ativar "Split de Pagamento" se
          "Financeiro" estiver inativo
        </li>
      </ul>
    </Card>
  );
}
