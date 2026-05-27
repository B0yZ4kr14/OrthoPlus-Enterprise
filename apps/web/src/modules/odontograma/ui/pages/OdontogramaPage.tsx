import { useState, lazy, Suspense } from "react";
import { Scan, History, GitCompare, Brain, Maximize2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { AlertCircle } from "lucide-react";
import { PatientSelector } from "@/components/shared/PatientSelector";
import { Odontograma2D } from "@/modules/pep/components/Odontograma2D";
import { OdontogramaHistory } from "@/modules/pep/components/OdontogramaHistory";
import { OdontogramaComparison } from "@/modules/pep/components/OdontogramaComparison";
import { OdontogramaAIAnalysis } from "@/modules/pep/components/OdontogramaAIAnalysis";
import { useOdontograma } from "@/modules/pep/hooks/useOdontograma";
import type { Patient } from "@/types/patient";

const Odontograma3D = lazy(() =>
  import("@/modules/pep/components/Odontograma3D").then((m) => ({ default: m.Odontograma3D }))
);

export function OdontogramaPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedIdsForComparison, setSelectedIdsForComparison] = useState<[string | null, string | null]>([null, null]);

  const prontuarioId = selectedPatient?.id ?? "";
  const { history, restoreFromHistory } = useOdontograma(prontuarioId);

  const handleCompare = (historyId: string) => {
    setSelectedIdsForComparison(([id1, id2]) => {
      if (!id1) return [historyId, id2];
      if (!id2) return [id1, historyId];
      return [historyId, null];
    });
  };

  const handleClearSelection = () => setSelectedIdsForComparison([null, null]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Odontograma"
        description="Visualização e registro do estado dental do paciente"
        icon={Scan}
      />

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Paciente</CardTitle>
          <CardDescription>
            Escolha um paciente para visualizar ou editar o odontograma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientSelector
            onSelect={(patient) => setSelectedPatient(patient)}
            selectedPatient={selectedPatient}
          />
        </CardContent>
      </Card>

      {!selectedPatient ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione um paciente para visualizar o odontograma.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="2d" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="2d" className="gap-2">
              <Scan className="h-4 w-4" />
              Odontograma 2D
            </TabsTrigger>
            <TabsTrigger value="3d" className="gap-2">
              <Maximize2 className="h-4 w-4" />
              Visualização 3D
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="comparar" className="gap-2">
              <GitCompare className="h-4 w-4" />
              Comparar
            </TabsTrigger>
            <TabsTrigger value="ia" className="gap-2">
              <Brain className="h-4 w-4" />
              Análise IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="2d">
            <Card>
              <CardHeader>
                <CardTitle>Odontograma 2D</CardTitle>
                <CardDescription>
                  Clique nos dentes para registrar condições e procedimentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Odontograma2D prontuarioId={selectedPatient.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="3d">
            <Card>
              <CardHeader>
                <CardTitle>Visualização 3D</CardTitle>
                <CardDescription>
                  Modelo tridimensional interativo do odontograma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
                  <Odontograma3D prontuarioId={selectedPatient.id} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Alterações</CardTitle>
                <CardDescription>
                  Registro cronológico de todas as alterações no odontograma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OdontogramaHistory
                  history={history}
                  onRestore={restoreFromHistory}
                  onCompare={handleCompare}
                  selectedForComparison={selectedIdsForComparison[0]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparar">
            <Card>
              <CardHeader>
                <CardTitle>Comparação de Odontogramas</CardTitle>
                <CardDescription>
                  Compare diferentes versões do odontograma lado a lado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OdontogramaComparison
                  history={history}
                  selectedIds={selectedIdsForComparison}
                  onClearSelection={handleClearSelection}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ia">
            <Card>
              <CardHeader>
                <CardTitle>Análise por IA</CardTitle>
                <CardDescription>
                  Análise automatizada usando inteligência artificial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OdontogramaAIAnalysis
                  prontuarioId={selectedPatient.id}
                  patientId={selectedPatient.id}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default OdontogramaPage;
