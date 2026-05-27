// cspell:disable
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Shield, Upload, CheckCircle } from "lucide-react";
import type { Validacao } from "./types";

interface ValidationTabProps {
  validacoes: Validacao[];
}

export function ValidationTab({ validacoes }: ValidationTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Validação de Assinaturas</CardTitle>
        <CardDescription>
          Verificar autenticidade e validade de assinaturas digitais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg border-dashed">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium mb-2">
                  Validar Documento Assinado
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Arraste um documento assinado ou clique para selecionar
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Documento
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">
              Validações Realizadas
            </h4>
            {validacoes.map((validation, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {validation.doc}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {validation.details} • {validation.date}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="default"
                  className="bg-success/10 text-success"
                >
                  {validation.result}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
