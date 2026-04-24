import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import type { BadgeFormProps } from "./types";
import { useBadgeForm } from "./useBadgeForm";
import { BasicInfoFields } from "./BasicInfoFields";
import { CriterioFields } from "./CriterioFields";
import { SharingToggle } from "./SharingToggle";

export function BadgeForm({ open, onOpenChange }: BadgeFormProps) {
  const { formData, loading, updateField, updateCriterioTipo, submit } =
    useBadgeForm(onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Badge</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <BasicInfoFields
            nome={formData.nome || ""}
            descricao={formData.descricao}
            icone={formData.icone || "🎯"}
            onUpdate={updateField}
          />

          <CriterioFields
            criterioTipo={formData.criterio_tipo || "pontos_totais"}
            criterioValor={formData.criterio_valor || 100}
            onTipoChange={updateCriterioTipo}
            onValorChange={(valor) => updateField("criterio_valor", valor)}
          />

          <SharingToggle
            checked={formData.compartilhavel ?? true}
            onChange={(checked) => updateField("compartilhavel", checked)}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Badge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
