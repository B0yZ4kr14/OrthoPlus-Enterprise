// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { Form } from "@orthoplus/core-ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
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
  const { form, handleSubmit, apiEnabled, apiAuthType, isEditing } = useFornecedorForm({
    fornecedor,
    onSubmit,
  });

  return (
    <Form {...form}>
      { }
      <form onSubmit={handleSubmit as any} className="space-y-6">
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
            <TabsTrigger value="api">Integração API</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos Automáticos</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-6">
            { }
            <DadosCadastraisTab form={form as any} />
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            { }
            <ApiIntegracaoTab
              form={form as any}
              apiEnabled={apiEnabled}
              apiAuthType={apiAuthType}
            />
          </TabsContent>

          <TabsContent value="pedidos" className="space-y-6">
            { }
            <PedidosAutomaticosTab form={form as any} apiEnabled={apiEnabled} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEditing ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
