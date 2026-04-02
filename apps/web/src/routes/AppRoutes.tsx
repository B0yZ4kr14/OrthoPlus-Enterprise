import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { LoadingState } from "@/components/shared/LoadingState";

// Core pages (não lazy - carregamento imediato)
import Demo from "@/modules/core/ui/pages/Demo";
import DashboardUnified from "@/modules/dashboard/ui/pages/DashboardUnified";
import Auth from "@/modules/auth/ui/pages/Auth";

// Lazy loaded modules - usando barrel exports
const PacientesListPage = lazy(() => import("@/modules/pacientes").then((m) => ({ default: m.PacientesListPage })));
const PatientFormPage = lazy(() => import("@/modules/pacientes").then((m) => ({ default: m.PatientFormPage })));
const PatientDetailPage = lazy(() => import("@/modules/pacientes").then((m) => ({ default: m.PatientDetailPage })));
const AgendaPage = lazy(() => import("@/modules/agenda").then((m) => ({ default: m.AgendaPage })));
const FinanceiroPage = lazy(() => import("@/modules/financeiro").then((m) => ({ default: m.FinanceiroPage })));
const PEPPage = lazy(() => import("@/modules/pep").then((m) => ({ default: m.PEPPage })));
const EstoquePage = lazy(() => import("@/modules/estoque").then((m) => ({ default: m.EstoquePage })));
const PDVPage = lazy(() => import("@/modules/pdv").then((m) => ({ default: m.PDVPage })));
const CRMPage = lazy(() => import("@/modules/crm").then((m) => ({ default: m.CRMPage })));

// Outros lazy imports (diretos)
const DentistasPage = lazy(() => import("@/modules/dentistas").then((m) => ({ default: m.DentistasPage })));
const FuncionariosPage = lazy(() => import("@/modules/funcionarios").then((m) => ({ default: m.FuncionariosPage })));
const ProcedimentosPage = lazy(() => import("@/modules/procedimentos").then((m) => ({ default: m.ProcedimentosPage })));
const OrcamentosPage = lazy(
  () => import("@/modules/orcamentos/ui/pages/OrcamentosPage"),
);

// Financeiro sub-pages
const ContasReceber = lazy(
  () => import("@/modules/financeiro/ui/pages/ContasReceber"),
);
const NotasFiscais = lazy(
  () => import("@/modules/financeiro/ui/pages/NotasFiscais"),
);
const Conciliacao = lazy(
  () => import("@/modules/financeiro/ui/pages/Conciliacao"),
);

// Contratos
const ContratosPage = lazy(
  () => import("@/modules/contratos/ui/pages/Contratos"),
);

// Cobranca / Inadimplência
const InadimplenciaPage = lazy(() => import("@/modules/cobranca").then((m) => ({ default: m.InadimplenciaPage })));

// Crypto
const CryptoPaymentPage = lazy(() => import("@/modules/crypto").then((m) => ({ default: m.CryptoPaymentPage })));

// Split Pagamento
const SplitPagamentoPage = lazy(() => import("@/modules/split-pagamento").then((m) => ({ default: m.SplitPagamentoPage })));

// Estoque sub-pages
const EstoqueInventarioHistorico = lazy(
  () => import("@/modules/estoque/ui/pages/EstoqueInventarioHistorico"),
);
const ScannerMobile = lazy(
  () => import("@/modules/estoque/ui/pages/ScannerMobile"),
);

// Inventário
const InventarioDashboard = lazy(() => import("@/modules/inventario").then((m) => ({ default: m.InventarioDashboard })));

// Marketing & Relacionamento
const MarketingAutoPage = lazy(() => import("@/modules/marketing-auto").then((m) => ({ default: m.MarketingAutoPage })));
const FidelidadePage = lazy(() => import("@/modules/marketing-auto").then((m) => ({ default: m.FidelidadePage })));
const RecallPage = lazy(() => import("@/modules/marketing-auto").then((m) => ({ default: m.RecallPage })));
const PortalPacientePage = lazy(() => import("@/modules/portal-paciente").then((m) => ({ default: m.PortalPacientePage })));

// BI & Dashboards
const BusinessIntelligence = lazy(() => import("@/modules/bi").then((m) => ({ default: m.BusinessIntelligence })));
const DashboardComercial = lazy(() => import("@/modules/dashboards").then((m) => ({ default: m.DashboardComercial })));

// Conformidade & Legal
const LGPDPage = lazy(() => import("@/modules/lgpd").then((m) => ({ default: m.LGPDPage })));
const AssinaturaICP = lazy(
  () => import("@/modules/pep/ui/pages/AssinaturaICP"),
);
const TISSPage = lazy(() => import("@/modules/tiss").then((m) => ({ default: m.TISSPage })));
const TeleodontoPage = lazy(() => import("@/modules/teleodonto").then((m) => ({ default: m.TeleodontoPage })));

// Odontograma (standalone page — reuses PEP components)
const OdontogramaPage = lazy(
  () => import("@/modules/odontograma/ui/pages/OdontogramaPage"),
);
// Tratamentos (standalone page — reuses PEP hooks)
const TratamentosPage = lazy(
  () => import("@/modules/tratamentos/ui/pages/TratamentosPage"),
);

// Inovação
const IARadiografia = lazy(() => import("@/modules/ia-radiografia").then((m) => ({ default: m.IARadiografia })));
const FluxoDigital = lazy(
  () => import("@/modules/pep/ui/pages/FluxoDigital"),
);

// Admin pages
const DatabaseMaintenancePage = lazy(
  () => import("@/modules/admin/ui/pages/DatabaseMaintenancePage"),
);
const BackupsPage = lazy(
  () => import("@/modules/admin/ui/pages/BackupsPage"),
);
const CryptoConfigPage = lazy(
  () => import("@/modules/admin/ui/pages/CryptoConfigPage"),
);
const GitHubManagerPage = lazy(
  () => import("@/modules/admin/ui/pages/GitHubManagerPage"),
);
const TerminalPage = lazy(
  () => import("@/modules/admin/ui/pages/TerminalPage"),
);
const WikiPage = lazy(
  () => import("@/modules/admin/ui/pages/WikiPage"),
);
const ADRsPage = lazy(
  () => import("@/modules/admin/ui/pages/ADRsPage"),
);
const MonitoringPage = lazy(
  () => import("@/modules/admin/ui/pages/MonitoringPage"),
);
const SystemLogsPage = lazy(
  () => import("@/modules/admin/ui/pages/SystemLogsPage"),
);
const ApiDocsPage = lazy(
  () => import("@/modules/admin/ui/pages/ApiDocsPage"),
);
const AuditLogs = lazy(
  () => import("@/modules/admin/ui/pages/AuditLogs"),
);
const AuditTrailViewer = lazy(
  () => import("@/modules/admin/ui/pages/AuditTrailViewer"),
);

// Settings / Configurações
const ModulesPage = lazy(
  () => import("@/modules/settings/ui/pages/ModulesPage"),
);
const Usuarios = lazy(
  () => import("@/modules/admin/ui/pages/Usuarios"),
);
const Configuracoes = lazy(
  () => import("@/modules/admin/ui/pages/Configuracoes"),
);
const HelpCenter = lazy(
  () => import("@/modules/admin/ui/pages/HelpCenter"),
);

/** Helper: wraps a page in ProtectedRoute + AppLayout + Suspense */
function protectedRoute(
  page: React.ReactNode,
  opts?: { moduleKey?: string; requireAdmin?: boolean },
) {
  return (
    <ProtectedRoute moduleKey={opts?.moduleKey} requireAdmin={opts?.requireAdmin}>
      <AppLayout>
        <Suspense fallback={<LoadingState />}>{page}</Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/demo" element={<Demo />} />
    <Route path="/auth" element={<Auth />} />

    {/* Protected Routes */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppLayout>
            <DashboardUnified />
          </AppLayout>
        </ProtectedRoute>
      }
    />

    {/* Pacientes Module */}
    <Route path="/pacientes" element={protectedRoute(<PacientesListPage />, { moduleKey: "PACIENTES" })} />
    <Route path="/pacientes/novo" element={protectedRoute(<PatientFormPage />, { moduleKey: "PACIENTES" })} />
    <Route path="/pacientes/:id" element={protectedRoute(<PatientDetailPage />, { moduleKey: "PACIENTES" })} />

    {/* Agenda Module */}
    <Route path="/agenda" element={protectedRoute(<AgendaPage />, { moduleKey: "AGENDA" })} />

    {/* Financeiro Module */}
    <Route path="/financeiro" element={protectedRoute(<FinanceiroPage />, { moduleKey: "FINANCEIRO" })} />
    <Route path="/financeiro/receber" element={protectedRoute(<ContasReceber />, { moduleKey: "FINANCEIRO" })} />
    <Route path="/financeiro/fiscal/notas" element={protectedRoute(<NotasFiscais />, { moduleKey: "FINANCEIRO" })} />
    <Route path="/financeiro/conciliacao" element={protectedRoute(<Conciliacao />, { moduleKey: "FINANCEIRO" })} />

    {/* PEP Module */}
    <Route path="/pep" element={protectedRoute(<PEPPage />, { moduleKey: "PEP" })} />
    <Route path="/pep/:patientId" element={protectedRoute(<PEPPage />, { moduleKey: "PEP" })} />
    <Route path="/assinatura-icp" element={protectedRoute(<AssinaturaICP />, { moduleKey: "PEP" })} />
    <Route path="/fluxo-digital" element={protectedRoute(<FluxoDigital />, { moduleKey: "PEP" })} />

    {/* Odontograma Module (standalone dental chart) */}
    <Route path="/odontograma" element={protectedRoute(<OdontogramaPage />, { moduleKey: "ODONTOGRAMA" })} />

    {/* Tratamentos (treatment plans) */}
    <Route path="/tratamentos" element={protectedRoute(<TratamentosPage />, { moduleKey: "PEP" })} />

    {/* Estoque Module */}
    <Route path="/estoque" element={protectedRoute(<EstoquePage />, { moduleKey: "ESTOQUE" })} />
    <Route path="/estoque/inventario-historico" element={protectedRoute(<EstoqueInventarioHistorico />, { moduleKey: "ESTOQUE" })} />
    <Route path="/estoque/scanner" element={protectedRoute(<ScannerMobile />, { moduleKey: "ESTOQUE" })} />
    <Route path="/inventario/dashboard" element={protectedRoute(<InventarioDashboard />, { moduleKey: "INVENTARIO" })} />

    {/* PDV Module */}
    <Route path="/pdv" element={protectedRoute(<PDVPage />, { moduleKey: "PDV" })} />

    {/* CRM Module */}
    <Route path="/crm" element={protectedRoute(<CRMPage />, { moduleKey: "CRM" })} />

    {/* Contratos */}
    <Route path="/contratos" element={protectedRoute(<ContratosPage />, { moduleKey: "CONTRATOS" })} />

    {/* Orçamentos */}
    <Route path="/orcamentos" element={protectedRoute(<OrcamentosPage />, { moduleKey: "ORCAMENTOS" })} />

    {/* Procedimentos */}
    <Route path="/procedimentos" element={protectedRoute(<ProcedimentosPage />, { moduleKey: "PROCEDIMENTOS" })} />

    {/* Dentistas / Funcionários */}
    <Route path="/dentistas" element={protectedRoute(<DentistasPage />, { moduleKey: "DENTISTAS" })} />
    <Route path="/funcionarios" element={protectedRoute(<FuncionariosPage />, { moduleKey: "FUNCIONARIOS" })} />

    {/* Cobranca / Inadimplência */}
    <Route path="/inadimplencia" element={protectedRoute(<InadimplenciaPage />, { moduleKey: "INADIMPLENCIA" })} />

    {/* Crypto Payments */}
    <Route path="/crypto-payment" element={protectedRoute(<CryptoPaymentPage />, { moduleKey: "CRYPTO_PAYMENTS" })} />

    {/* Split Pagamento */}
    <Route path="/split-pagamento" element={protectedRoute(<SplitPagamentoPage />, { moduleKey: "SPLIT_PAGAMENTO" })} />

    {/* Marketing & Relacionamento */}
    <Route path="/marketing-auto" element={protectedRoute(<MarketingAutoPage />, { moduleKey: "MARKETING_AUTO" })} />
    <Route path="/fidelidade" element={protectedRoute(<FidelidadePage />, { moduleKey: "FIDELIDADE" })} />
    <Route path="/recall" element={protectedRoute(<RecallPage />, { moduleKey: "MARKETING_AUTO" })} />
    <Route path="/portal-paciente" element={protectedRoute(<PortalPacientePage />, { moduleKey: "PORTAL_PACIENTE" })} />

    {/* BI & Dashboards */}
    <Route path="/bi" element={protectedRoute(<BusinessIntelligence />, { moduleKey: "BI" })} />
    <Route path="/dashboards/comercial" element={protectedRoute(<DashboardComercial />, { moduleKey: "BI" })} />

    {/* Conformidade & Legal */}
    <Route path="/lgpd" element={protectedRoute(<LGPDPage />, { moduleKey: "LGPD" })} />
    <Route path="/faturamento-tiss" element={protectedRoute(<TISSPage />, { moduleKey: "TISS" })} />
    <Route path="/teleodonto" element={protectedRoute(<TeleodontoPage />, { moduleKey: "TELEODONTO" })} />

    {/* Inovação & Tecnologia */}
    <Route path="/ia-radiografia" element={protectedRoute(<IARadiografia />, { moduleKey: "IA" })} />

    {/* Admin Pages (requireAdmin) */}
    <Route path="/admin/database" element={protectedRoute(<DatabaseMaintenancePage />, { requireAdmin: true })} />
    <Route path="/admin/backups" element={protectedRoute(<BackupsPage />, { requireAdmin: true })} />
    <Route path="/admin/crypto-config" element={protectedRoute(<CryptoConfigPage />, { requireAdmin: true })} />
    <Route path="/admin/github" element={protectedRoute(<GitHubManagerPage />, { requireAdmin: true })} />
    <Route path="/admin/terminal" element={protectedRoute(<TerminalPage />, { requireAdmin: true })} />
    <Route path="/admin/wiki" element={protectedRoute(<WikiPage />, { requireAdmin: true })} />
    <Route path="/admin/adrs" element={protectedRoute(<ADRsPage />, { requireAdmin: true })} />
    <Route path="/admin/monitoring" element={protectedRoute(<MonitoringPage />, { requireAdmin: true })} />
    <Route path="/admin/logs" element={protectedRoute(<SystemLogsPage />, { requireAdmin: true })} />
    <Route path="/admin/api-docs" element={protectedRoute(<ApiDocsPage />, { requireAdmin: true })} />
    <Route path="/admin/audit" element={protectedRoute(<AuditLogs />, { requireAdmin: true })} />
    <Route path="/admin/audit-trail" element={protectedRoute(<AuditTrailViewer />, { requireAdmin: true })} />

    {/* Configurações */}
    <Route path="/configuracoes/modulos" element={protectedRoute(<ModulesPage />, { requireAdmin: true })} />
    <Route path="/usuarios" element={protectedRoute(<Usuarios />, { requireAdmin: true })} />
    <Route path="/configuracoes" element={protectedRoute(<Configuracoes />, { requireAdmin: true })} />
    <Route path="/help" element={protectedRoute(<HelpCenter />)} />
  </Routes>
);

export default AppRoutes;
