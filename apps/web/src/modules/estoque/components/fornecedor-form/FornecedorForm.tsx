// cspell:disable
import { useState } from "react";
import { Button } from "@orthoplus/core-ui/button";
import { Form } from "@orthoplus/core-ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import type { Fornecedor } from "../../types/estoque.types";
import { useFornecedorForm } from "./useFornecedorForm";
import { DadosCadastraisTab } from "./DadosCadastraisTab";
import { ApiIntegracaoTab } from "./ApiIntegracaoTab";
import { PedidosAutomaticosTab } from "./PedidosAutomaticosTab";

interface FornecedorFormProps {
  fornecedor?: Fornecedor;
  onSubmit: (data: Fornecedor) => void;
  onCancel: () => void;
}

export function FornecedorForm({
  fornecedor,
  onSubmit,
  onCancel,
}: FornecedorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { form, handleSubmit, apiEnabled, apiAuthType, isEditing } =
    useFornecedorForm({
      fornecedor,
      onSubmit,
    });

  return (
    <Form {...form}>
      {}
      <form
        onSubmit={async (e) => {
          setIsLoading(true);
          try {
            await handleSubmit(e);
          } finally {
            setIsLoading(false);
          }
        }}
        className="space-y-6"
      >
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
            <TabsTrigger value="api">Integração API</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos Automáticos</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-6">
            {}
            <DadosCadastraisTab form={form} />
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            {}
            <ApiIntegracaoTab
              form={form}
              apiEnabled={apiEnabled}
              apiAuthType={apiAuthType}
            />
          </TabsContent>

          <TabsContent value="pedidos" className="space-y-6">
            {}
            <PedidosAutomaticosTab form={form} apiEnabled={apiEnabled} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
