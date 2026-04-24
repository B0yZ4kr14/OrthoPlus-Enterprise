import type { ColorPreviewProps } from "../types";

export function ColorPreview({ background, primary, odontograma }: ColorPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div
          className="w-8 h-8 rounded border"
          style={{ background }}
          title="Background"
        />
        <div
          className="w-8 h-8 rounded border"
          style={{ background: primary }}
          title="Primary"
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Odontograma:
      </div>
      <div className="flex gap-2">
        <div
          className="w-6 h-6 rounded-full border"
          style={{ background: odontograma.higido }}
          title="Hígido"
        />
        <div
          className="w-6 h-6 rounded-full border"
          style={{ background: odontograma.carie }}
          title="Cárie"
        />
        <div
          className="w-6 h-6 rounded-full border"
          style={{ background: odontograma.tratado }}
          title="Tratado"
        />
        <div
          className="w-6 h-6 rounded-full border"
          style={{ background: odontograma.implante }}
          title="Implante"
        />
      </div>
    </div>
  );
}
