/**
 * Integração Contábil Config - Componente Principal (Orquestrador)
 *
 * REFATORADO: 501 linhas → ~150 linhas
 * - Extraiu lógica de dados para useContabilConfig
 * - Extraiu formulário para ConfigForm
 * - Extraiu listas para IntegracoesList e EnviosHistory
 * - Separou tipos em types.ts
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { Loader2, Building2 } from "lucide-react";

import { useContabilConfig } from "../useContabilConfig";
import { ConfigForm } from "../ConfigForm";
import { IntegracoesList } from "../IntegracoesList";
import { EnviosHistory } from "../EnviosHistory";
import { DEFAULT_FORM_DATA, type ConfigFormData } from "../types";

export { DEFAULT_FORM_DATA };
export type { ConfigFormData };

export default function IntegracaoContabilConfig() {
  const { selectedClinic } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("config");
  const [formData, setFormData] = useState<ConfigFormData>(DEFAULT_FORM_DATA);
  const clinicId = selectedClinic?.id ?? null;

  const { configs, envios, loading, saving, saveConfig, enviarManual } =
    useContabilConfig(clinicId, toast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId) return;

    await saveConfig(formData, clinicId);
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleEnviarManual = async (software: string) => {
    if (!clinicId) return;
    await enviarManual(software, clinicId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <CardTitle>Integração com Softwares Contábeis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="integracoes">Integrações Ativas</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Envios</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <ConfigForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="integracoes" className="space-y-3">
            <IntegracoesList
              configs={configs}
              onEnviarManual={handleEnviarManual}
            />
          </TabsContent>

          <TabsContent value="historico" className="space-y-2">
            <EnviosHistory envios={envios} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
