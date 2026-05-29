// cspell:disable
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { usePrevisaoReposicao } from "./usePrevisaoReposicao";
import { HeaderSection } from "./HeaderSection";
import { ActionButtons } from "./ActionButtons";
import { EventoDialog } from "./EventoDialog";
import { PrevisoesTab } from "./PrevisoesTab";
import { ComparativoTab } from "./ComparativoTab";

export function PrevisaoReposicao() {
  const {
    produtos,
    previsoes,
    loading,
    sendingEmail,
    eventosFuturos,
    dialogOpen,
    setDialogOpen,
    gerarPrevisoes,
    enviarAlertaEmail,
    adicionarEvento,
    removerEvento,
  } = usePrevisaoReposicao();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <HeaderSection
          onGerarPrevisoes={gerarPrevisoes}
          loading={loading}
          disabled={produtos.length === 0}
        />
        <ActionButtons
          eventosCount={eventosFuturos.length}
          hasPrevisoes={!!previsoes && previsoes.length > 0}
          sendingEmail={sendingEmail}
          onOpenEventos={() => setDialogOpen(true)}
          onEnviarEmail={enviarAlertaEmail}
        />
      </div>

      <EventoDialog
        eventos={eventosFuturos}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdicionar={adicionarEvento}
        onRemover={removerEvento}
      />

      {previsoes && previsoes.length > 0 && (
        <Tabs defaultValue="previsoes" className="w-full">
          <TabsList>
            <TabsTrigger value="previsoes">Previsões IA</TabsTrigger>
            <TabsTrigger value="comparativo">
              Comparativo IA vs Tradicional
            </TabsTrigger>
          </TabsList>
          <TabsContent value="previsoes">
            <PrevisoesTab previsoes={previsoes} />
          </TabsContent>
          <TabsContent value="comparativo">
            <ComparativoTab previsoes={previsoes} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default PrevisaoReposicao;
