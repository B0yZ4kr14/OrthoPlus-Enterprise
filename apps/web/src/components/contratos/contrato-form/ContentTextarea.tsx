import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import type { FieldError, UseFormRegister } from "react-hook-form";

interface ContentTextareaProps {
  register: UseFormRegister<any>;
  error?: FieldError;
}

export function ContentTextarea({ register, error }: ContentTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="conteudo_html">
        Conteúdo do Contrato (HTML)
        <span className="text-destructive"> *</span>
      </Label>
      <Textarea
        id="conteudo_html"
        {...register("conteudo_html")}
        placeholder="Conteúdo HTML do contrato..."
        rows={10}
        className="font-mono text-sm"
      />
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}
