import { Card } from "@orthoplus/core-ui/card";

export function InstructionsCard() {
  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <h3 className="font-semibold mb-3">🎯 Experimente</h3>
      <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
        <li>
          Tente desativar &quot;Financeiro&quot; (não funcionará enquanto Split
          estiver ativo)
        </li>
        <li>Desative &quot;Split de Pagamento&quot; primeiro</li>
        <li>Agora desative &quot;Financeiro&quot; (funcionará)</li>
        <li>
          Tente ativar &quot;Inadimplência&quot; (não funcionará sem Financeiro
          ativo)
        </li>
        <li>
          Ative &quot;Financeiro&quot; novamente e depois
          &quot;Inadimplência&quot;
        </li>
      </ol>
    </Card>
  );
}
