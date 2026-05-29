// cspell:disable
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";

export function ConfigTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Programa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pontos_consulta" className="text-sm font-medium">
              Pontos por Consulta
            </label>
            <input
              id="pontos_consulta"
              name="pontos_consulta"
              type="number"
              className="w-full mt-1 p-2 border rounded"
              defaultValue={10}
              aria-label="Pontos por Consulta"
            />
          </div>
          <div>
            <label htmlFor="pontos_real" className="text-sm font-medium">
              Pontos por R$ Gasto
            </label>
            <input
              id="pontos_real"
              name="pontos_real"
              type="number"
              step="0.1"
              className="w-full mt-1 p-2 border rounded"
              defaultValue={1}
              aria-label="Pontos por R$ Gasto"
            />
          </div>
          <div>
            <label htmlFor="pontos_indicacao" className="text-sm font-medium">
              Pontos por Indicação
            </label>
            <input
              id="pontos_indicacao"
              name="pontos_indicacao"
              type="number"
              className="w-full mt-1 p-2 border rounded"
              defaultValue={50}
              aria-label="Pontos por Indicação"
            />
          </div>
          <div>
            <label htmlFor="validade_pontos" className="text-sm font-medium">
              Validade dos Pontos (dias)
            </label>
            <input
              id="validade_pontos"
              name="validade_pontos"
              type="number"
              className="w-full mt-1 p-2 border rounded"
              defaultValue={365}
              aria-label="Validade dos Pontos (dias)"
            />
          </div>
        </div>
        <Button>Salvar Configurações</Button>
      </CardContent>
    </Card>
  );
}
