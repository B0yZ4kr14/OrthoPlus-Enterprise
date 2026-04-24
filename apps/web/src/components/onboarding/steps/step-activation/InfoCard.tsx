import { Card } from "@orthoplus/core-ui/card";
import { Info } from "lucide-react";

export function InfoCard() {
  return (
    <Card className="p-4 bg-blue-500/10 border-blue-500/20">
      <div className="flex gap-3">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold mb-1">Como funciona a ativação de módulos?</h3>
          <p className="text-sm text-muted-foreground">
            Você pode ativar ou desativar módulos a qualquer momento. Módulos marcados como
            <strong> "Essencial"</strong> não podem ser desativados pois são fundamentais para o
            funcionamento do sistema. Esta é uma demonstração - após o onboarding, você poderá
            configurar os módulos reais em <strong>Configurações → Meus Módulos</strong>.
          </p>
        </div>
      </div>
    </Card>
  );
}
