// cspell:disable
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { FileText } from "lucide-react";

export function DocumentsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos Assinados</CardTitle>
        <CardDescription>
          Histórico de documentos com assinatura digital
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Lista de documentos assinados será exibida aqui</p>
          <p className="text-sm mt-2">
            Filtros por tipo, data, status e signatários
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
