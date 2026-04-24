import { Card } from "@orthoplus/core-ui/card";

export function ProTipCard() {
  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <h3 className="font-semibold mb-3">💡 Dica Pro</h3>
      <p className="text-sm text-muted-foreground">
        O sistema validará automaticamente as dependências antes de ativar ou
        desativar módulos. Se uma ação não for permitida, você receberá uma
        mensagem clara explicando o motivo e quais módulos precisam ser
        ativados/desativados primeiro.
      </p>
    </Card>
  );
}
