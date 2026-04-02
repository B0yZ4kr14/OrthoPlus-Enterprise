import { useState } from "react";
import { ClipboardPlus, Plus, Clock, CheckCircle, XCircle, Pause } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@orthoplus/core-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { Badge } from "@orthoplus/core-ui/badge";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { AlertCircle } from "lucide-react";
import { PatientSelector } from "@/components/shared/PatientSelector";
import { useTratamentos } from "@/modules/pep/hooks/useTratamentos";
import { toast } from "sonner";
import type { Patient } from "@/types/patient";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
    PLANEJADO: { variant: "secondary", icon: Clock },
    EM_ANDAMENTO: { variant: "default", icon: ClipboardPlus },
    CONCLUIDO: { variant: "outline", icon: CheckCircle },
    CANCELADO: { variant: "destructive", icon: XCircle },
    PAUSADO: { variant: "secondary", icon: Pause },
  };
  const { variant, icon: Icon } = config[status] || config.PLANEJADO;
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {status.replace("_", " ")}
    </Badge>
  );
}

export function TratamentosPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const {
    tratamentos,
    loading,
    criarTratamento,
    iniciarTratamento,
    concluirTratamento,
  } = useTratamentos(selectedPatient?.id);

  const planejados = tratamentos.filter((t) => t.status === "PLANEJADO");
  const emAndamento = tratamentos.filter((t) => t.status === "EM_ANDAMENTO");
  const concluidos = tratamentos.filter((t) => t.status === "CONCLUIDO");

  const handleIniciar = async (id: string) => {
    try {
      await iniciarTratamento(id);
      toast.success("Tratamento iniciado com sucesso!");
    } catch {
      toast.error("Erro ao iniciar tratamento");
    }
  };

  const handleConcluir = async (id: string) => {
    try {
      await concluirTratamento(id);
      toast.success("Tratamento concluído!");
    } catch {
      toast.error("Erro ao concluir tratamento");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planos de Tratamento"
        description="Gerencie os planos de tratamento dos pacientes"
        icon={<ClipboardPlus className="h-6 w-6" />}
        actions={
          selectedPatient && (
            <Button onClick={() => criarTratamento()} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Plano
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Paciente</CardTitle>
          <CardDescription>
            Escolha um paciente para gerenciar seus planos de tratamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientSelector
            onSelect={(patient: Patient) => setSelectedPatient(patient)}
            selected={selectedPatient}
          />
        </CardContent>
      </Card>

      {!selectedPatient ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione um paciente para visualizar os planos de tratamento.
          </AlertDescription>
        </Alert>
      ) : loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Carregando tratamentos...
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="todos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todos">
              Todos ({tratamentos.length})
            </TabsTrigger>
            <TabsTrigger value="planejados">
              Planejados ({planejados.length})
            </TabsTrigger>
            <TabsTrigger value="andamento">
              Em Andamento ({emAndamento.length})
            </TabsTrigger>
            <TabsTrigger value="concluidos">
              Concluídos ({concluidos.length})
            </TabsTrigger>
          </TabsList>

          {(["todos", "planejados", "andamento", "concluidos"] as const).map((tab) => {
            const items =
              tab === "todos"
                ? tratamentos
                : tab === "planejados"
                ? planejados
                : tab === "andamento"
                ? emAndamento
                : concluidos;

            return (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {items.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Nenhum tratamento encontrado nesta categoria.
                    </CardContent>
                  </Card>
                ) : (
                  items.map((tratamento) => (
                    <Card key={tratamento.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle className="text-lg">
                            {tratamento.descricao || "Plano de Tratamento"}
                          </CardTitle>
                          <CardDescription>
                            {tratamento.dentes?.join(", ") || "Sem dentes especificados"}
                          </CardDescription>
                        </div>
                        <StatusBadge status={tratamento.status} />
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {tratamento.procedimentos?.length || 0} procedimento(s)
                            {tratamento.dataInicio && (
                              <span className="ml-4">
                                Início: {new Date(tratamento.dataInicio).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {tratamento.status === "PLANEJADO" && (
                              <Button
                                size="sm"
                                onClick={() => handleIniciar(tratamento.id)}
                              >
                                Iniciar
                              </Button>
                            )}
                            {tratamento.status === "EM_ANDAMENTO" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConcluir(tratamento.id)}
                              >
                                Concluir
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}

export default TratamentosPage;
