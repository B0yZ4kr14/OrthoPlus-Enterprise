// cspell:disable
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Key, CheckCircle, AlertTriangle, Upload } from "lucide-react";
import type { Certificado } from "./types";

interface CertificatesTabProps {
  certificados: Certificado[];
}

export function CertificatesTab({ certificados }: CertificatesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Certificados Digitais</CardTitle>
        <CardDescription>
          Gerenciamento de certificados ICP-Brasil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certificados.map((cert, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{cert.type}</p>
                    {cert.status === "active" ? (
                      <Badge
                        variant="default"
                        className="flex items-center space-x-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>Ativo</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="flex items-center space-x-1 bg-warning/5"
                      >
                        <AlertTriangle className="h-3 w-3 text-warning" />
                        <span>Expira em breve</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {cert.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Serial: {cert.serial} • Emissor: {cert.issuer}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Válido até: {cert.validUntil}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  Ver Detalhes
                </Button>
                {cert.status === "expiring" && (
                  <Button size="sm">Renovar</Button>
                )}
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Importar Novo Certificado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
