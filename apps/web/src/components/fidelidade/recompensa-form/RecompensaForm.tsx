// cspell:disable
import { useRecompensaForm } from "./useRecompensaForm";
import { useProcedimentos } from "./useProcedimentos";
import { NomeInput } from "./NomeInput";
import { DescricaoInput } from "./DescricaoInput";
import { PontosInput } from "./PontosInput";
import { TipoSelect } from "./TipoSelect";
import { ValorDescontoInput } from "./ValorDescontoInput";
import { ProcedimentoSelect } from "./ProcedimentoSelect";
import { AtivoSwitch } from "./AtivoSwitch";
import { FormActions } from "./FormActions";
import type { RecompensaFormProps } from "./types";

export function RecompensaForm({ editingRecompensa, onSuccess }: RecompensaFormProps) {
  const { formData, loading, handleInputChange, handleSubmit } = useRecompensaForm({
    editingRecompensa,
    onSuccess,
  });
  const { procedimentos, loading: loadingProcedimentos } = useProcedimentos();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <NomeInput value={formData.nome} onChange={(v) => handleInputChange("nome", v)} />
      <DescricaoInput
        value={formData.descricao}
        onChange={(v) => handleInputChange("descricao", v)}
      />
      <PontosInput
        value={formData.pontos_necessarios}
        onChange={(v) => handleInputChange("pontos_necessarios", v)}
      />
      <TipoSelect value={formData.tipo} onChange={(v) => handleInputChange("tipo", v)} />
      <ValorDescontoInput
        tipo={formData.tipo}
        value={formData.valor_desconto}
        onChange={(v) => handleInputChange("valor_desconto", v)}
      />
      {formData.tipo === "PROCEDIMENTO_GRATIS" && (
        <ProcedimentoSelect
          procedimentos={procedimentos}
          value={formData.procedimento_id}
          onChange={(v) => handleInputChange("procedimento_id", v)}
          loading={loadingProcedimentos}
        />
      )}
      <AtivoSwitch value={formData.ativo} onChange={(v) => handleInputChange("ativo", v)} />
      <FormActions loading={loading} isEditing={!!editingRecompensa} />
    </form>
  );
}
