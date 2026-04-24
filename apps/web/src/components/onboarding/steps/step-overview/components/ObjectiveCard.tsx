import { Card } from "@orthoplus/core-ui/card";

export function ObjectiveCard() {
  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <h3 className="font-semibold mb-3">🎯 Objetivo deste Onboarding</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>• Apresentar os principais recursos e módulos do sistema</li>
        <li>
          • Ensinar como ativar/desativar módulos conforme sua necessidade
        </li>
        <li>• Explicar as dependências entre módulos</li>
        <li>• Configurar usuários e permissões granulares</li>
        <li>• Preparar você para usar o sistema completo com confiança</li>
      </ul>
    </Card>
  );
}
