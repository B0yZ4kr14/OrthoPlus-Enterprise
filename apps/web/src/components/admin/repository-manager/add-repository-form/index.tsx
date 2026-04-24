import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import type { AddRepositoryFormProps } from "./types";
import { FormFields } from "./components/FormFields";
import { ActionButtons } from "./components/ActionButtons";

export * from "./types";
export { FormFields, ActionButtons };

export function AddRepositoryForm({
  formData,
  testingConnection,
  isAutenticando,
  onSubmit,
  onTestConnection,
  onChange,
}: AddRepositoryFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Novo Repositório</CardTitle>
        <CardDescription>Configure um novo repositório GitHub para integração</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormFields formData={formData} onChange={onChange} />
          <ActionButtons
            testingConnection={testingConnection}
            isAutenticando={isAutenticando}
            isTokenValid={!!formData.token}
            onTestConnection={onTestConnection}
          />
        </form>
      </CardContent>
    </Card>
  );
}
