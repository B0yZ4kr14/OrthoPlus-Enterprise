/**
 * FuncionarioForm - Componente Orquestrador (Refatorado)
 * 
 * ANTES: 606 linhas
 * DEPOIS: ~90 linhas + estrutura modular
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { Button } from "@orthoplus/core-ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { useFuncionarioForm } from "./useFuncionarioForm";
import { DadosPessoaisTab } from "./DadosPessoaisTab";
import { DadosProfissionaisTab } from "./DadosProfissionaisTab";
import { PermissoesManager } from "../PermissoesManager";
import type { Funcionario } from "../../types/funcionario.types";

interface FuncionarioFormProps {
  funcionario?: Funcionario;
  onSubmit: (data: Funcionario) => void;
  onCancel: () => void;
}

export function FuncionarioForm({
  funcionario,
  onSubmit,
  onCancel,
}: FuncionarioFormProps) {
  const {
    avatarUrl,
    setAvatarUrl,
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    selectedDias,
    setSelectedDias,
    permissoes,
    setPermissoes,
    handleFormSubmit,
  } = useFuncionarioForm({ funcionario, onSubmit });

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          {funcionario ? "Editar Funcionário" : "Novo Funcionário"}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent>
          <Tabs defaultValue="pessoais" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pessoais">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="profissionais">Dados Profissionais</TabsTrigger>
              <TabsTrigger value="permissoes">Permissões</TabsTrigger>
            </TabsList>

            <TabsContent value="pessoais" className="space-y-4">
              <DadosPessoaisTab
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
              />
            </TabsContent>

            <TabsContent value="profissionais" className="space-y-4">
              <DadosProfissionaisTab
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
                selectedDias={selectedDias}
                setSelectedDias={setSelectedDias}
              />
            </TabsContent>

            <TabsContent value="permissoes" className="space-y-4">
              <PermissoesManager
                permissoes={permissoes}
                onChange={setPermissoes}
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {funcionario ? "Atualizar" : "Cadastrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
