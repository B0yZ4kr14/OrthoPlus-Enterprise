// cspell:disable
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { useSplitConfigForm } from "./useSplitConfigForm";
import { DentistaSelect } from "./DentistaSelect";
import { TipoSplitSelect } from "./TipoSplitSelect";
import { ProcedimentoSelect } from "./ProcedimentoSelect";
import { PercentualInputs } from "./PercentualInputs";
import { AtivoSwitch } from "./AtivoSwitch";
import { FormActions } from "./FormActions";
import type { SplitConfigFormProps } from "./types";

export function SplitConfigForm({
  open,
  onOpenChange,
  dentistas,
  procedimentos,
  editingConfig,
}: SplitConfigFormProps) {
  const { formData, loading, handleSubmit, handlePercentualDentistaChange, handleInputChange } =
    useSplitConfigForm(editingConfig, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingConfig ? "Editar" : "Nova"} Configuração de Split
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DentistaSelect
              value={formData.dentist_id || ""}
              dentistas={dentistas}
              onChange={(value) => handleInputChange("dentist_id", value)}
            />
            <TipoSplitSelect
              value={formData.tipo_split || "PROCEDIMENTO"}
              onChange={(value) => handleInputChange("tipo_split", value)}
            />
          </div>

          {formData.tipo_split === "PROCEDIMENTO" && (
            <ProcedimentoSelect
              value={formData.procedimento_id}
              procedimentos={procedimentos}
              onChange={(value) => handleInputChange("procedimento_id", value)}
            />
          )}

          <PercentualInputs
            percentualDentista={formData.percentual_dentista || 50}
            percentualClinica={formData.percentual_clinica || 50}
            onDentistaChange={handlePercentualDentistaChange}
          />

          <AtivoSwitch
            checked={formData.ativo ?? true}
            onChange={(checked) => handleInputChange("ativo", checked)}
          />

          <FormActions
            loading={loading}
            isEditing={!!editingConfig}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
