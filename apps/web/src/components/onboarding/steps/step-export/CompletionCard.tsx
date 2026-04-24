import { Card } from "@orthoplus/core-ui/card";
import { CheckCircle2 } from "lucide-react";

export function CompletionCard() {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Configuração Completa!</h3>
          <p className="text-muted-foreground">
            Você aprendeu sobre módulos, dependências e como gerenciar o sistema
          </p>
        </div>
      </div>
    </Card>
  );
}
