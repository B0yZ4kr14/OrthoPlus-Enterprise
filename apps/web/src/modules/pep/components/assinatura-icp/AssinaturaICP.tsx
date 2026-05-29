// cspell:disable
import { Card, CardContent } from "@orthoplus/core-ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { Shield } from "lucide-react";
import { useAssinaturaICP } from "./useAssinaturaICP";
import { Header } from "./Header";
import { KpiCards } from "./KpiCards";
import { OverviewTab } from "./OverviewTab";
import { CertificatesTab } from "./CertificatesTab";
import { DocumentsTab } from "./DocumentsTab";
import { RequestsTab } from "./RequestsTab";
import { ValidationTab } from "./ValidationTab";

export function AssinaturaICP() {
  const {
    hasAccess,
    activeTab,
    setActiveTab,
    kpiData,
    documentosRecentes,
    solicitacoesPendentes,
    certificados,
    certificadosTipos,
    validacoes,
  } = useAssinaturaICP();

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-warning" />
              <p>Você não tem acesso a este módulo.</p>
              <p className="text-sm mt-2">
                Entre em contato com o administrador para solicitar acesso.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />
      <KpiCards data={kpiData} />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="validation">Validação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab
            documentos={documentosRecentes}
            solicitacoes={solicitacoesPendentes}
            certificadosTipos={certificadosTipos}
          />
        </TabsContent>

        <TabsContent value="certificates">
          <CertificatesTab certificados={certificados} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>

        <TabsContent value="requests">
          <RequestsTab />
        </TabsContent>

        <TabsContent value="validation">
          <ValidationTab validacoes={validacoes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AssinaturaICP;
