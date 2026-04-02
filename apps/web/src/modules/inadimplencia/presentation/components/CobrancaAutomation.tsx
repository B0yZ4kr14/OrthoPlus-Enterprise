import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@orthoplus/core-ui/card";
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import { Button } from "@orthoplus/core-ui/button";
import { Switch } from "@orthoplus/core-ui/switch";
import { Textarea } from "@orthoplus/core-ui/textarea";

export function CobrancaAutomation() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Automação de Cobrança</CardTitle>
          <CardDescription>Configure mensagens automáticas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-sms">SMS Automático</Label>
            <Switch id="auto-sms" />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-whatsapp">WhatsApp Automático</Label>
            <Switch id="auto-whatsapp" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-email">E-mail Automático</Label>
            <Switch id="auto-email" defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">Enviar após (dias)</Label>
            <Input id="days" type="number" placeholder="3" defaultValue="3" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template de Mensagem</CardTitle>
          <CardDescription>Personalize a mensagem de cobrança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Mensagem</Label>
            <Textarea
              id="template"
              placeholder="Olá {NOME}, identificamos um débito de {VALOR}..."
              rows={6}
              defaultValue="Olá {NOME}, identificamos um débito de {VALOR} com vencimento em {DATA}. Por favor, regularize sua situação."
            />
          </div>

          <div className="flex justify-end">
            <Button>Salvar Template</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
