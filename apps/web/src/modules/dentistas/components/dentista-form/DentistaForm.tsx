/**
 * DentistaForm - Componente Orquestrador (Refatorado)
 * 
 * ANTES: 574 linhas
 * DEPOIS: ~100 linhas + estrutura modular
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { Button } from "@orthoplus/core-ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { useDentistaForm } from "./useDentistaForm";
import { DadosPessoaisTab } from "./DadosPessoaisTab";
import { DadosProfissionaisTab } from "./DadosProfissionaisTab";
import { ConfiguracoesTab } from "./ConfiguracoesTab";
import type { Dentista } from "../../types/dentista.types";

interface DentistaFormProps {
  dentista?: Dentista;
  onSubmit: (data: Dentista) => void;
  onCancel: () => void;
}

export function DentistaForm({
  dentista,
  onSubmit,
  onCancel,
}: DentistaFormProps) {
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
    selectedEspecialidades,
    setSelectedEspecialidades,
    handleFormSubmit,
  } = useDentistaForm({ dentista, onSubmit });

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          {dentista ? "Editar Dentista" : "Novo Dentista"}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent>
          <Tabs defaultValue="pessoais" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pessoais">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="profissionais">Profissional</TabsTrigger>
              <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
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
                selectedEspecialidades={selectedEspecialidades}
                setSelectedEspecialidades={setSelectedEspecialidades}
              />
            </TabsContent>

            <TabsContent value="configuracoes" className="space-y-4">
              <ConfiguracoesTab
                register={register}
                setValue={setValue}
                watch={watch}
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {dentista ? "Atualizar" : "Cadastrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
