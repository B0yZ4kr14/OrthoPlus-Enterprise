// cspell:disable
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { FileText, CheckCircle, Download, FileSignature } from "lucide-react";
import type {
  DocumentoAssinado,
  SolicitacaoPendente,
  CertificadoTipo,
} from "./types";

interface OverviewTabProps {
  documentos: DocumentoAssinado[];
  solicitacoes: SolicitacaoPendente[];
  certificadosTipos: CertificadoTipo[];
}

const variantClasses: Record<CertificadoTipo["variant"], string> = {
  blue: "bg-info/5",
  green: "bg-success/5",
  purple: "bg-purple-50",
};

export function OverviewTab({
  documentos,
  solicitacoes,
  certificadosTipos,
}: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Certificados por Tipo</CardTitle>
            <CardDescription>
              Distribuição dos certificados digitais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {certificadosTipos.map((cert) => (
              <div key={cert.tipo} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className={variantClasses[cert.variant]}
                  >
                    {cert.tipo}
                  </Badge>
                  <span className="text-sm">
                    {cert.quantidade} certificado
                    {cert.quantidade > 1 ? "s" : ""}
                  </span>
                </div>
                <span
                  className={`text-sm ${cert.status === "Válidos" ? "text-muted-foreground" : "text-warning"}`}
                >
                  {cert.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos Assinados Recentemente</CardTitle>
            <CardDescription>Últimas assinaturas realizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {documentos.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.type} • {doc.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="default"
                    className="flex items-center space-x-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>{doc.signers} assin.</span>
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações Pendentes</CardTitle>
          <CardDescription>
            Documentos aguardando sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {solicitacoes.map((request, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/10">
                    <FileSignature className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">{request.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Solicitado por: {request.requester}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.date} • Expira em {request.expires}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    Visualizar
                  </Button>
                  <Button size="sm">
                    <FileSignature className="h-4 w-4 mr-2" />
                    Assinar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
