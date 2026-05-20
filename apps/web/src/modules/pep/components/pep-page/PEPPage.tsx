// cspell:disable
import { FileText, History, Activity, Smile, Box, Clock, GitCompare, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@orthoplus/core-ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { ProntuarioPDF } from "@/modules/pep/components/ProntuarioPDF";
import { AssinaturaDigital } from "@/modules/pep/components/AssinaturaDigital";
import { usePEPPage } from "./usePEPPage";
import { PatientSelectorCard } from "./PatientSelectorCard";
import { HistoricoTab } from "./HistoricoTab";
import { TratamentosTab } from "./TratamentosTab";
import { OdontogramaTab } from "./OdontogramaTab";
import { Odontograma3DTab } from "./Odontograma3DTab";
import { HistoricoOdontoTab } from "./HistoricoOdontoTab";
import { ComparacaoOdontoTab } from "./ComparacaoOdontoTab";
import { AnexosTab } from "./AnexosTab";
import type { TabValue } from "./types";

export function PEPPage() {
  const {
    selectedPatient,
    setSelectedPatient,
    activeTab,
    setActiveTab,
    dialogs,
    setDialogOpen,
    selectedForComparison,
    handleCompareSelect,
    handleClearComparison,
    prontuarioId,
    history,
    restoreFromHistory,
  } = usePEPPage();

  if (!selectedPatient) {
    return <PatientSelectorCard onSelect={setSelectedPatient} />;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={`PEP - ${selectedPatient.full_name}`}
          description="Prontuário eletrônico completo do paciente"
          icon={FileText}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedPatient(null)}>
            Trocar Paciente
          </Button>
          <ProntuarioPDF
            prontuarioId={prontuarioId || ""}
            patientName={selectedPatient.full_name}
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="historico" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="tratamentos" className="gap-2">
            <Activity className="h-4 w-4" />
            Tratamentos
          </TabsTrigger>
          <TabsTrigger value="odontograma" className="gap-2">
            <Smile className="h-4 w-4" />
            Odontograma 2D
          </TabsTrigger>
          <TabsTrigger value="odontograma-3d" className="gap-2">
            <Box className="h-4 w-4" />
            Odontograma 3D
          </TabsTrigger>
          <TabsTrigger value="historico-odonto" className="gap-2">
            <Clock className="h-4 w-4" />
            Histórico Odonto
          </TabsTrigger>
          <TabsTrigger value="comparacao-odonto" className="gap-2">
            <GitCompare className="h-4 w-4" />
            Comparar
          </TabsTrigger>
          <TabsTrigger value="anexos" className="gap-2">
            <Upload className="h-4 w-4" />
            Anexos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historico">
          <HistoricoTab
            prontuarioId={prontuarioId}
            isDialogOpen={dialogs.historico}
            onDialogOpenChange={(open) => setDialogOpen("historico", open)}
          />
        </TabsContent>

        <TabsContent value="tratamentos">
          <TratamentosTab
            prontuarioId={prontuarioId}
            dialogs={{
              prescricao: dialogs.prescricao,
              receita: dialogs.receita,
              tratamento: dialogs.tratamento,
            }}
            onDialogChange={(key, open) => setDialogOpen(key, open)}
          />
        </TabsContent>

        <TabsContent value="odontograma">
          <OdontogramaTab prontuarioId={prontuarioId} />
        </TabsContent>

        <TabsContent value="odontograma-3d">
          <Odontograma3DTab prontuarioId={prontuarioId} />
        </TabsContent>

        <TabsContent value="historico-odonto">
          <HistoricoOdontoTab
            prontuarioId={prontuarioId}
            history={history}
            onRestore={restoreFromHistory}
            onCompare={handleCompareSelect}
            selectedForComparison={
              selectedForComparison[0] || selectedForComparison[1] || null
            }
          />
        </TabsContent>

        <TabsContent value="comparacao-odonto">
          <ComparacaoOdontoTab
            prontuarioId={prontuarioId}
            history={history}
            selectedIds={selectedForComparison}
            onClearSelection={handleClearComparison}
          />
        </TabsContent>

        <TabsContent value="anexos">
          <AnexosTab prontuarioId={prontuarioId} />
        </TabsContent>
      </Tabs>

      {prontuarioId && (
        <AssinaturaDigital
          onSave={() => undefined}
        />
      )}
    </div>
  );
}

export default PEPPage;
