import { Button } from "@orthoplus/core-ui/button";
import { Upload } from "lucide-react";

export function ImagingHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Imagens e Radiografias</h2>
        <p className="text-muted-foreground">Histórico de exames de imagem</p>
      </div>
      <Button>
        <Upload className="h-4 w-4 mr-2" />
        Upload de Imagem
      </Button>
    </div>
  );
}
