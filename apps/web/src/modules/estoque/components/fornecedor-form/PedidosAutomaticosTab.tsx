// cspell:disable
import { Switch } from "@orthoplus/core-ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@orthoplus/core-ui/form";
import type { Fornecedor } from "../../types/estoque.types";

import type { UseFormReturn } from "react-hook-form";

interface PedidosAutomaticosTabProps {
  form: UseFormReturn<Fornecedor>;
  apiEnabled: boolean;
}

export function PedidosAutomaticosTab({
  form,
  apiEnabled,
}: PedidosAutomaticosTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Automáticos</CardTitle>
        <CardDescription>
          Configure o envio automático de pedidos quando produtos atingirem
          estoque mínimo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="autoOrderEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Habilitar Pedidos Automáticos
                </FormLabel>
                <FormDescription>
                  Quando ativado, pedidos serão enviados automaticamente via API
                  quando produtos atingirem estoque mínimo
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!apiEnabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!apiEnabled && (
          <p className="text-sm text-muted-foreground mt-2">
            Configure a integração com a API primeiro para habilitar pedidos
            automáticos
          </p>
        )}
      </CardContent>
    </Card>
  );
}
