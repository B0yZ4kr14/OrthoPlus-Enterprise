// cspell:disable
import { Button } from "@orthoplus/core-ui/button";
import { FileSignature, Upload } from "lucide-react";

export function Header() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Assinatura Digital ICP-Brasil
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestão de certificados digitais e assinaturas qualificadas
        </p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importar Certificado
        </Button>
        <Button>
          <FileSignature className="h-4 w-4 mr-2" />
          Nova Assinatura
        </Button>
      </div>
    </div>
  );
}
