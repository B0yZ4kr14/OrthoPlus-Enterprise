import { lazy, Suspense } from 'react';
import { Database, Info, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@orthoplus/core-ui/tabs';
import { useDatabaseConfig } from '../hooks/useDatabaseConfig';
import { useToast } from '@orthoplus/core-hooks';
import type { MaintenanceTool, EngineInfo } from '../types';

// Lazy loading das tabs para melhorar performance
const MotorTab = lazy(() => import('../components/tabs/MotorTab'));
const ConfigTab = lazy(() => import('../components/tabs/ConfigTab'));
const RepairTab = lazy(() => import('../components/tabs/RepairTab'));
const MigrationTab = lazy(() => import('../components/tabs/MigrationTab'));
const TemplatesTab = lazy(() => import('../components/tabs/TemplatesTab'));
const DocsTab = lazy(() => import('../components/tabs/DocsTab'));

// Componente de fallback para loading
function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span className="ml-3 text-muted-foreground">Carregando...</span>
    </div>
  );
}

// Dados mockados para engine details
const ENGINE_DETAILS: Record<string, EngineInfo> = {
  sqlite: {
    id: 'sqlite',
    name: 'SQLite [DEV ONLY]',
    icon: '📁',
    port: null,
    description: '⚠️ APENAS PARA DESENVOLVIMENTO LOCAL - NÃO USE EM PRODUÇÃO',
    when_to_use: [
      '⚠️ DESENVOLVIMENTO: Testes locais apenas',
      '⚠️ DESENVOLVIMENTO: Prototipagem rápida',
      '❌ NÃO RECOMENDADO: Produção',
      '❌ NÃO RECOMENDADO: Múltiplos usuários',
    ],
    limitations: [
      'Limite de conexões simultâneas',
      'Não recomendado para múltiplos clientes',
      'Sem replicação nativa',
    ],
    features: [
      'Zero configuração',
      'Arquivo único portátil',
      'Sem servidor externo',
      'Transações ACID',
      'Full-text search',
    ],
    install_ubuntu: 'sudo apt install sqlite3',
    maintenance_tools: [
      { name: 'VACUUM', description: 'Compacta o banco e recupera espaço', sql: 'VACUUM;' },
      { name: 'Integrity Check', description: 'Verifica integridade dos dados', sql: 'PRAGMA integrity_check;' },
      { name: 'Reindex', description: 'Reconstrói todos os índices', sql: 'REINDEX;' },
      { name: 'Analyze', description: 'Atualiza estatísticas das tabelas', sql: 'ANALYZE;' },
    ],
  },
  postgresql: {
    id: 'postgresql',
    name: 'PostgreSQL',
    icon: '🐘',
    port: 5432,
    description: 'Banco de dados robusto e escalável - ÚNICO SUPORTADO EM PRODUÇÃO',
    when_to_use: [
      '✅ PRODUÇÃO: Ambientes corporativos',
      '✅ PRODUÇÃO: Múltiplos terminais em rede',
      '✅ PRODUÇÃO: Alta disponibilidade e replicação',
      '✅ PRODUÇÃO: Integração com outras aplicações',
    ],
    limitations: [
      'Requer instalação separada (Docker/Ubuntu)',
      'Mais complexo que SQLite (mas mais robusto)',
    ],
    features: [
      '🌟 JSON/JSONB nativo para dados flexíveis',
      '🌟 Full-text search avançado',
      '🌟 Replicação síncrona/assíncrona',
      '🌟 Extensões (PostGIS, UUID, etc)',
      '🌟 MVCC robusto - alta concorrência',
      '🌟 ACID compliant - dados seguros',
    ],
    install_ubuntu: '# Ubuntu Server LTS\nsudo apt update\nsudo apt install postgresql-16 postgresql-contrib\nsudo systemctl enable postgresql',
    maintenance_tools: [
      { name: 'VACUUM FULL', description: 'Compacta e recupera espaço', sql: 'VACUUM FULL;' },
      { name: 'ANALYZE', description: 'Atualiza estatísticas', sql: 'ANALYZE;' },
      { name: 'REINDEX DATABASE', description: 'Reconstrói índices', sql: 'REINDEX DATABASE orthoplus;' },
      { name: 'pg_checksums', description: 'Verifica checksums das páginas', sql: 'pg_checksums --check' },
    ],
  },
  mariadb: {
    id: 'mariadb',
    name: 'MariaDB [MIGRAÇÃO]',
    icon: '🐬',
    port: 3306,
    description: '⚠️ APENAS PARA MIGRAÇÃO DE SISTEMAS LEGADOS MySQL/MariaDB',
    when_to_use: [
      '⚠️ MIGRAÇÃO: Importar dados de sistema legado',
      '⚠️ MIGRAÇÃO: Transição temporária',
      '❌ NÃO RECOMENDADO: Novos projetos',
      '❌ NÃO RECOMENDADO: Produção OrthoPlus',
    ],
    limitations: [
      'Menos recursos avançados que PostgreSQL',
      'Licenciamento pode ser complexo',
    ],
    features: [
      'Compatível com MySQL',
      'Performance otimizada',
      'Galera Cluster para replicação',
      'Colunas virtuais dinâmicas',
    ],
    install_ubuntu: 'sudo apt install mariadb-server',
    maintenance_tools: [
      { name: 'OPTIMIZE TABLE', description: 'Otimiza tabelas', sql: 'OPTIMIZE TABLE table_name;' },
      { name: 'ANALYZE TABLE', description: 'Atualiza estatísticas', sql: 'ANALYZE TABLE table_name;' },
      { name: 'CHECK TABLE', description: 'Verifica integridade', sql: 'CHECK TABLE table_name;' },
    ],
  },
  firebird: {
    id: 'firebird',
    name: 'Firebird [MIGRAÇÃO]',
    icon: '🔥',
    port: 3050,
    description: '⚠️ APENAS PARA MIGRAÇÃO DE SISTEMAS LEGADOS Firebird/Interbase',
    when_to_use: [
      '⚠️ MIGRAÇÃO: Importar dados de sistema Firebird legado',
      '⚠️ MIGRAÇÃO: Transição temporária',
      '❌ NÃO RECOMENDADO: Novos projetos',
      '❌ NÃO RECOMENDADO: Produção OrthoPlus',
    ],
    limitations: [
      'Menos popular e comunidade menor',
      'Menos recursos modernos',
      'Ferramentas de administração limitadas',
    ],
    features: [
      'Multiplataforma',
      'Modo embedded',
      'Transações ACID',
      'Triggers e stored procedures',
    ],
    install_ubuntu: 'sudo apt install firebird3.0-server',
    maintenance_tools: [
      { name: 'gfix', description: 'Reparo e manutenção', sql: 'gfix -v -full database.fdb' },
      { name: 'gbak', description: 'Backup e restore', sql: 'gbak -b database.fdb backup.fbk' },
    ],
  },
};

// Docs para cada engine
const ENGINE_DOCS: Record<string, Array<{ name: string; url: string }>> = {
  sqlite: [
    { name: 'SQLite Documentation', url: 'https://sqlite.org/docs.html' },
    { name: 'SQL Syntax', url: 'https://sqlite.org/lang.html' },
    { name: 'CLI Tutorial', url: 'https://sqlite.org/cli.html' },
  ],
  postgresql: [
    { name: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/' },
    { name: 'Tutorial Iniciante', url: 'https://www.postgresqltutorial.com/' },
    { name: 'PostgreSQL Wiki', url: 'https://wiki.postgresql.org/' },
  ],
  mariadb: [
    { name: 'MariaDB Documentation', url: 'https://mariadb.com/kb/en/documentation/' },
    { name: 'Getting Started', url: 'https://mariadb.com/kb/en/getting-started/' },
  ],
  firebird: [
    { name: 'Firebird Docs', url: 'https://firebirdsql.org/en/documentation/' },
    { name: 'Reference Manual', url: 'https://firebirdsql.org/file/documentation/reference_manuals/fblangref40/firebird-40-language-reference.pdf' },
  ],
};

export function DatabaseConfigPage() {
  const {
    activeTab,
    setActiveTab,
    selectedEngine,
    setSelectedEngine,
    engines,
    config,
    setConfig,
    isLoading,
    testResult,
    history,
    showPassword,
    setShowPassword,
    migrationSource,
    setMigrationSource,
    migrationTarget,
    setMigrationTarget,
    formErrors,
    setFormErrors,
    testConnection,
    saveConfig,
    TABS,
  } = useDatabaseConfig();

  const { showSuccess, showInfo } = useToast();

  const engineDetails = ENGINE_DETAILS[selectedEngine];
  const engineDocs = ENGINE_DOCS[selectedEngine] || [];

  const handleSelectEngine = (engineId: string) => {
    setSelectedEngine(engineId as typeof selectedEngine);
    setConfig({
      ...config,
      engine: engineId as typeof selectedEngine,
    });
    setFormErrors({});
  };

  const handleApplyTemplate = (engineId: string) => {
    showSuccess(`Template ${engineId} aplicado!`);
  };

  const handleExecuteMaintenance = (tool: MaintenanceTool) => {
    showInfo(`Executando: ${tool.name}`);
  };

  const handleClearHistory = () => {
    showInfo('Histórico limpo');
  };

  const handleExport = () => {
    showInfo('Exportação iniciada');
  };

  const handleImport = () => {
    showInfo('Importação em desenvolvimento');
  };

  const handleMigrate = () => {
    if (migrationSource === migrationTarget) {
      showInfo('Selecione motores diferentes');
      return;
    }
    showInfo(`Migração de ${migrationSource} para ${migrationTarget} iniciada`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
            <Database className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Banco de Dados Avançado</h1>
            <p className="text-muted-foreground">Configure o motor e conexão do banco de dados</p>
          </div>
        </div>
        
        {/* Banner informativo sobre PostgreSQL */}
        <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary">
                PostgreSQL é o único engine suportado em produção
              </p>
              <p className="text-muted-foreground mt-1">
                A partir da versão 2.0, o OrthoPlus Enterprise utiliza exclusivamente PostgreSQL em ambientes de produção. 
                Outros engines (SQLite, MariaDB, Firebird) estão disponíveis apenas para desenvolvimento local e migração de dados.
              </p>
            </div>
          </div>
        </div>
        
        {/* Aviso quando não estiver em PostgreSQL */}
        {selectedEngine !== 'postgresql' && (
          <div className="mt-3 p-4 bg-warning/10 border border-warning/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">
                  Engine selecionado não é recomendado para produção
                </p>
                <p className="text-muted-foreground mt-1">
                  {selectedEngine === 'sqlite' 
                    ? 'SQLite é indicado apenas para desenvolvimento local e testes.'
                    : 'Este engine é indicado apenas para migração de dados de sistemas legados.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-6 mb-6">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content com Suspense */}
        <div className="bg-card/50 border border-border rounded-xl p-6">
          <Suspense fallback={<TabLoadingFallback />}>
            {activeTab === 'motor' && (
              <MotorTab
                engines={engines}
                selectedEngine={selectedEngine}
                engineDetails={engineDetails}
                onSelectEngine={handleSelectEngine}
              />
            )}

            {activeTab === 'config' && (
              <ConfigTab
                selectedEngine={selectedEngine}
                config={config}
                setConfig={setConfig}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isLoading={isLoading}
                testResult={testResult}
                onSave={saveConfig}
                onTest={testConnection}
              />
            )}

            {activeTab === 'reparo' && (
              <RepairTab
                selectedEngine={selectedEngine}
                engines={engines}
                maintenanceTools={engineDetails?.maintenance_tools || []}
                history={history}
                isLoading={isLoading}
                executing={null}
                onExecute={handleExecuteMaintenance}
                onClearHistory={handleClearHistory}
              />
            )}

            {activeTab === 'migracao' && (
              <MigrationTab
                engines={engines}
                migrationSource={migrationSource}
                setMigrationSource={setMigrationSource}
                migrationTarget={migrationTarget}
                setMigrationTarget={setMigrationTarget}
                isLoading={isLoading}
                onExport={handleExport}
                onImport={handleImport}
                onMigrate={handleMigrate}
              />
            )}

            {activeTab === 'templates' && (
              <TemplatesTab
                engines={engines}
                onApplyTemplate={handleApplyTemplate}
              />
            )}

            {activeTab === 'docs' && (
              <DocsTab
                engineName={engineDetails?.name || selectedEngine}
                docs={engineDocs}
                installCommand={engineDetails?.install_ubuntu}
              />
            )}
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}

export default DatabaseConfigPage;
