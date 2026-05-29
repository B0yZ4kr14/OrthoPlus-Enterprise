// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Switch } from "@orthoplus/core-ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
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
  FormMessage,
} from "@orthoplus/core-ui/form";
import type { Fornecedor } from "../../types/estoque.types";

import type { UseFormReturn } from "react-hook-form";

interface ApiIntegracaoTabProps {
  form: UseFormReturn<Fornecedor>;
  apiEnabled: boolean;
  apiAuthType: string;
}

export function ApiIntegracaoTab({
  form,
  apiEnabled,
  apiAuthType,
}: ApiIntegracaoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Integração com API</CardTitle>
        <CardDescription>
          Configure a conexão com a API do fornecedor para envio automático de
          pedidos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="apiEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Habilitar Integração API
                </FormLabel>
                <FormDescription>
                  Ative para permitir envio automático de pedidos via API do
                  fornecedor
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {apiEnabled && (
          <>
            <FormField
              control={form.control}
              name="apiEndpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint da API *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.fornecedor.com/pedidos"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL completa para envio de pedidos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiAuthType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Autenticação *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sem autenticação</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {apiAuthType === "basic" && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="apiUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apiPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {apiAuthType === "bearer" && (
              <FormField
                control={form.control}
                name="apiToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bearer Token</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {apiAuthType === "api_key" && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="apiKeyHeader"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Header</FormLabel>
                      <FormControl>
                        <Input placeholder="X-API-Key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apiKeyValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da API Key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="sk_live_..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="apiRequestFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formato da Requisição</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="form">Form Data</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
