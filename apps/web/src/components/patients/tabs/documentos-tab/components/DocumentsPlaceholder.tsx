import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { FileImage } from "lucide-react";

export function DocumentsPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Documentos e Imagens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <FileImage className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Módulo de documentos em desenvolvimento</p>
          <p className="text-sm mt-2">
            Aqui serão exibidos documentos, imagens radiográficas, fotos e
            anexos do paciente
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
