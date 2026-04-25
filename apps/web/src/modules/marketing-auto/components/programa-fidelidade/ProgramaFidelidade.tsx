// cspell:disable
import { Award } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { RecompensaForm } from "@/components/fidelidade/RecompensaForm";
import { BadgeForm } from "@/components/fidelidade/BadgeForm";
import { useProgramaFidelidade } from "./useProgramaFidelidade";
import { KPICards } from "./KPICards";
import { LoadingState } from "./LoadingState";
import { PacientesTab } from "./PacientesTab";
import { RecompensasTab } from "./RecompensasTab";
import { IndicacoesTab } from "./IndicacoesTab";
import { BadgesTab } from "./BadgesTab";
import { ConfigTab } from "./ConfigTab";

export default function ProgramaFidelidade() {
  const {
    pontos,
    recompensas,
    indicacoes,
    loading,
    recompensaFormOpen,
    badgeFormOpen,
    editingRecompensa,
    setRecompensaFormOpen,
    setBadgeFormOpen,
    triggerConfetti,
    handleShareBadge,
    handleEditRecompensa,
    handleCloseRecompensaForm,
  } = useProgramaFidelidade();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Award}
        title="Programa de Fidelidade"
        description="Sistema de pontos, recompensas e gamificação para engajamento de pacientes"
      />

      <KPICards />

      <Tabs defaultValue="pacientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pacientes">Pacientes & Pontos</TabsTrigger>
          <TabsTrigger value="recompensas">Recompensas</TabsTrigger>
          <TabsTrigger value="indicacoes">Indicações</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="pacientes" className="space-y-4">
          <PacientesTab
            pacientes={pontos as any}
            onShareBadge={handleShareBadge}
            onTriggerConfetti={triggerConfetti}
          />
        </TabsContent>

        <TabsContent value="recompensas" className="space-y-4">
          <RecompensasTab
            recompensas={recompensas as any}
            onAdd={() => setRecompensaFormOpen(true)}
            onEdit={handleEditRecompensa}
          />
        </TabsContent>

        <TabsContent value="indicacoes" className="space-y-4">
          <IndicacoesTab indicacoes={indicacoes as any} />
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <BadgesTab onCreateBadge={() => setBadgeFormOpen(true)} />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <ConfigTab />
        </TabsContent>
      </Tabs>

      <RecompensaForm
        open={recompensaFormOpen}
        onOpenChange={handleCloseRecompensaForm}
        procedimentos={[]}
        editingRecompensa={editingRecompensa || undefined}
      />

      <BadgeForm open={badgeFormOpen} onOpenChange={setBadgeFormOpen} />
    </div>
  );
}
