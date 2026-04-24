import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";

export function ConfigCard() {
  const webhookUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/webhooks/github`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Webhooks</CardTitle>
        <CardDescription>
          Configure webhooks no seu repositório GitHub para receber notificações
          em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">URL do Webhook</h4>
          <code className="block bg-muted p-3 rounded text-sm">{webhookUrl}</code>
          <p className="text-xs text-muted-foreground">
            Adicione esta URL nas configurações de Webhooks do repositório
            GitHub
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Eventos Recomendados</h4>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            <li>Push events (commits)</li>
            <li>Pull request events</li>
            <li>Workflow run events</li>
            <li>Release events</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Content Type</h4>
          <p className="text-sm text-muted-foreground">
            Selecione:{" "}
            <code className="bg-muted px-2 py-1 rounded">application/json</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
