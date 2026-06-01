import { useState } from "react";
import {
  Settings,
  Package,
  Users,
  Database,
  Shield,
  Bell,
  Download,
  Upload,
  Wrench,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { Button } from "@orthoplus/core-ui/button";
import { useNavigate } from "react-router-dom";
import ModulesSimple from "@/modules/settings/ui/pages/ModulesSimple";
import DatabaseBackupTab from "@/components/settings/DatabaseBackupTab";
import { UserManagementTab } from "@/components/settings/UserManagementTab";
import { ModulePermissionsManager } from "@/components/settings/ModulePermissionsManager";
import { PermissionTemplates } from "@/components/settings/PermissionTemplates";
import { PermissionAuditLogs } from "@/components/settings/PermissionAuditLogs";
import { DataMigrationWizard } from "@/components/settings/DataMigrationWizard";
import { GitHubIntegrationConfig } from "@/components/settings/GitHubIntegrationConfig";
import { AuthenticationConfig } from "@/components/settings/AuthenticationConfig";
import { AIModelConfig } from "@/components/settings/AIModelConfig";
import { BackendSelector } from "@/components/settings/backend-selector";

export default function Configuracoes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("modules");
  const [showExportWizard, setShowExportWizard] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);

  const configSections = [
    {
      id: "modules",
      label: "Módulos",
      icon: Package,
      description: "Gerenciar módulos ativos do sistema",
    },
    {
      id: "permissions",
      label: "Permissões",
      icon: Shield,
      description: "Gerenciar permissões de acesso por módulo",
    },
    {
      id: "users",
      label: "Usuários",
      icon: Users,
      description: "Gerenciar usuários e permissões",
    },
    {
      id: "administration",
      label: "Administração",
      icon: Wrench,
      description: "GitHub, Autenticação e Modelos de IA",
    },
    {
      id: "backups",
      label: "Backups",
      icon: Database,
      description: "Gestão completa de backups e restauração",
    },
    {
      id: "database",
      label: "Banco de Dados",
      icon: Database,
      description: "Migração e exportação de dados",
    },
    {
      id: "notifications",
      label: "Notificações",
      icon: Bell,
      description: "Configurar alertas e notificações",
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações Administrativas"
        icon={Settings}
        description="Gerencie todos os aspectos do sistema Ortho +"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Módulos Ativos"
          value={7}
          icon={Package}
          variant="primary"
          description="Funcionalidades habilitadas"
        />
        <StatsCard
          title="Usuários"
          value={1}
          icon={Users}
          variant="success"
          description="Administradores e membros"
        />
        <StatsCard
          title="Backups"
          value={0}
          icon={Database}
          variant="warning"
          description="Backups automáticos"
        />
        <StatsCard
          title="Notificações"
          value={0}
          icon={Bell}
          variant="default"
          description="Alertas configurados"
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-7">
          {configSections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              disabled={section.comingSoon}
              className="relative"
            >
              <section.icon className="w-4 h-4 mr-2" />
              {section.label}
              {section.comingSoon && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  Em Breve
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <Card variant="elevated">
            <ModulesSimple />
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card variant="elevated">
            <PermissionTemplates />
          </Card>
          <Card variant="elevated">
            <ModulePermissionsManager />
          </Card>
          <Card variant="elevated">
            <PermissionAuditLogs />
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card variant="elevated">
            <UserManagementTab />
          </Card>
        </TabsContent>

        <TabsContent value="administration" className="space-y-4">
          <Card variant="elevated">
            <BackendSelector />
          </Card>
          <Card variant="elevated">
            <GitHubIntegrationConfig />
          </Card>
          <Card variant="elevated">
            <AuthenticationConfig />
          </Card>
          <Card variant="elevated">
            <AIModelConfig />
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card variant="elevated">
            <DatabaseBackupTab />
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gerenciamento Avançado de Banco de Dados</span>
                <Button
                  variant="elevated"
                  size="sm"
                  onClick={() => navigate("/configuracoes/database")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Painel Completo
                </Button>
              </CardTitle>
              <CardDescription>
                Controle por categoria, backups, manutenção e monitoramento de
                motores de banco de dados.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Migração de Dados</CardTitle>
              <CardDescription>
                Exporte ou importe dados completos da clínica entre instalações
                do OrthoPlus Enterprise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button type="button"
                  onClick={() => setShowExportWizard(true)}
                  variant="elevated"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button type="button"
                  onClick={() => setShowImportWizard(true)}
                  variant="elevated"
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Dados
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <DatabaseBackupTab />
          </Card>
        </TabsContent>

        <DataMigrationWizard
          open={showExportWizard}
          onClose={() => setShowExportWizard(false)}
          mode="export"
        />

        <DataMigrationWizard
          open={showImportWizard}
          onClose={() => setShowImportWizard(false)}
          mode="import"
        />

        <TabsContent value="notifications" className="space-y-4">
          <Card variant="gradient">
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Configure alertas por email, SMS e notificações push para
                eventos importantes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Em Desenvolvimento</p>
                <p className="text-sm">
                  Esta funcionalidade estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
