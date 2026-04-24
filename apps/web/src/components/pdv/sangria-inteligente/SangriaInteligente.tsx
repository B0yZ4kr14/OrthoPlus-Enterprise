// cspell:disable
import { useSangriaInteligente } from "./useSangriaInteligente";
import { AlertaIA } from "./AlertaIA";
import { AnaliseRiscoCard } from "./AnaliseRiscoCard";
import { SangriaForm } from "./SangriaForm";
import type { SangriaInteligenteProps } from "./types";

export function SangriaInteligente({ caixaId, valorAtualCaixa }: SangriaInteligenteProps) {
  const {
    sugestaoIA,
    valorSangria,
    setValorSangria,
    observacoes,
    setObservacoes,
    isPending,
    handleSangria,
  } = useSangriaInteligente(caixaId, valorAtualCaixa);

  return (
    <div className="space-y-4">
      <AlertaIA sugestao={sugestaoIA || null} />
      <AnaliseRiscoCard analise={sugestaoIA?.analise || null} />
      <SangriaForm
        valorSangria={valorSangria}
        observacoes={observacoes}
        valorAtualCaixa={valorAtualCaixa}
        isPending={isPending}
        onValorChange={setValorSangria}
        onObservacoesChange={setObservacoes}
        onSubmit={handleSangria}
      />
    </div>
  );
}
