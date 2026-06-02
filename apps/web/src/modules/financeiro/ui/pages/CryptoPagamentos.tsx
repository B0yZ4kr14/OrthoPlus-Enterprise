import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCrypto } from "@/modules/crypto/hooks/useCrypto";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import {
  CryptoKPISkeleton,
  CryptoListSkeleton,
  CryptoTableSkeleton,
} from "@/components/crypto/CryptoSkeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import {
  Bitcoin,
  Wallet,
  ArrowRightLeft,
  TrendingUp,
  RefreshCw,
  Settings,
  Plus,
  ExternalLink,
  QrCode,
  Info,
  Bell,
  Activity,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  exchangeLabels,
  coinLabels,
  statusLabels,
  tipoLabels,
  CryptoWallet,
  ExchangeConfig,
} from "@/modules/crypto/types/crypto.types";
import { Skeleton } from "@orthoplus/core-ui/skeleton";
import { ExchangeConfigForm } from "@/components/crypto/ExchangeConfigForm";
import { WalletForm } from "@/components/crypto/WalletForm";
import { BitcoinQRCodeDialog } from "@/components/crypto/BitcoinQRCodeDialog";
import { WalletQRPreview } from "@/components/crypto/WalletQRPreview";
import { CryptoCalculator } from "@/components/crypto/CryptoCalculator";
import { CryptoTour } from "@/components/crypto/CryptoTour";
import { CryptoAnalysisDashboard } from "@/modules/crypto/components/CryptoAnalysisDashboard";
import { AdvancedTechnicalAnalysis } from "@/components/crypto/AdvancedTechnicalAnalysis";
import { ConversionSimulator } from "@/components/crypto/ConversionSimulator";
import { CryptoPortfolioDashboard } from "@/components/crypto/CryptoPortfolioDashboard";
import { CryptoTransactionsView } from "../views/crypto/CryptoTransactionsView";
import { CryptoWalletsView } from "../views/crypto/CryptoWalletsView";
import { CryptoExchangesView } from "../views/crypto/CryptoExchangesView";
import { CryptoAlertsView } from "../views/crypto/CryptoAlertsView";
import { CryptoTechnicalAnalysisView } from "../views/crypto/CryptoTechnicalAnalysisView";
import { CryptoSimulatorView } from "../views/crypto/CryptoSimulatorView";
import { CryptoComparativeView } from "../views/crypto/CryptoComparativeView";
import { BitcoinInfoCard } from "@/components/crypto/BitcoinInfoCard";
import { useCryptoNotifications } from "@/hooks/useCryptoNotifications";
import { CryptoPriceAlertForm } from "@/modules/crypto/components/CryptoPriceAlertForm";
import { CascadeAlertWizard } from "@/modules/crypto/components/CascadeAlertWizard";
import { CryptoComparativeDashboard } from "@/modules/crypto/components/CryptoComparativeDashboard";
import { useCryptoPriceAlerts } from "@/modules/crypto/hooks/useCryptoPriceAlerts";
import { Switch } from "@orthoplus/core-ui/switch";
import { Trash2, TrendingDown, BarChart3 } from "lucide-react";
import { DCABacktesting } from "@/components/crypto/DCABacktesting";
import { VolatilityAlerts } from "@/components/crypto/VolatilityAlerts";

export default function CryptoPagamentos() {
  const { clinicId } = useAuth();
  const { connected: notificationsConnected, requestNotificationPermission } =
    useCryptoNotifications();

  const {
    exchanges,
    wallets,
    transactions,
    loading,
    syncWalletBalance,
    convertCryptoToBRL,
    getDashboardData,
    createExchangeConfig,
    createWallet,
    createPaymentRequest,
  } = useCrypto(clinicId || "");

  const {
    alerts,
    loading: alertsLoading,
    createAlert,
    toggleAlert,
    deleteAlert,
  } = useCryptoPriceAlerts();

  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(
    null,
  );
  const [syncingWallet, setSyncingWallet] = useState<string | null>(null);
  const [convertingTx, setConvertingTx] = useState<string | null>(null);
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [cascadeWizardOpen, setCascadeWizardOpen] = useState(false);

  const dashboardData = getDashboardData();

  const handleSyncWallet = async (walletId: string) => {
    setSyncingWallet(walletId);
    try {
      await syncWalletBalance(walletId);
    } finally {
      setSyncingWallet(null);
    }
  };

  const handleConvert = async (transactionId: string) => {
    setConvertingTx(transactionId);
    try {
      await convertCryptoToBRL(transactionId);
    } finally {
      setConvertingTx(null);
    }
  };

  const handleExchangeSubmit = async (data: any) => {
    await createExchangeConfig(data);
    setExchangeDialogOpen(false);
  };

  const handleWalletSubmit = async (data: any) => {
    await createWallet(data);
    setWalletDialogOpen(false);
  };

  const handleAlertSubmit = async (data: any) => {
    await createAlert(data);
    setAlertDialogOpen(false);
  };

  const handleCascadeSubmit = async (cascadeAlerts: any[]) => {
    try {
      // Criar todos os alertas da cascata
      for (const alertData of cascadeAlerts) {
        await createAlert(alertData);
      }
      toast.success(
        `Estratégia DCA criada com ${cascadeAlerts.length} níveis!`,
      );
      setCascadeWizardOpen(false);
    } catch (error) {
      toast.error("Erro ao criar cascade");
      toast.error("Erro ao criar estratégia em cascata");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Bitcoin}
          title="Pagamentos em Criptomoedas"
          description="Receba pagamentos em Bitcoin e outras criptomoedas"
        />

        <CryptoKPISkeleton />

        <Card depth="normal" className="mt-6">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <CryptoListSkeleton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CryptoTour />

      <PageHeader
        icon={Bitcoin}
        title="Pagamentos em Criptomoedas"
        description="Receba pagamentos em Bitcoin e outras criptomoedas de forma profissional e segura"
      />

      {/* Indicador de conexão WebSocket */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Badge
            variant={notificationsConnected ? "success" : "secondary"}
            className="gap-2"
          >
            <div
              className={`w-2 h-2 rounded-full ${notificationsConnected ? "bg-success" : "bg-muted-foreground"}`}
            />
            {notificationsConnected
              ? "Notificações em Tempo Real Ativas"
              : "Notificações Desconectadas"}
          </Badge>
          {!notificationsConnected && (
            <Button type="button"
              variant="outline"
              size="sm"
              onClick={requestNotificationPermission}
            >
              Ativar Notificações Push
            </Button>
          )}
        </div>
      </div>

      {/* Card Informativo sobre Bitcoin */}
      <BitcoinInfoCard />

      {!clinicId && (
        <Card variant="default" className="border-warning/50 bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">
                  Nenhuma clínica selecionada
                </p>
                <p className="text-sm text-warning mt-1">
                  Selecione uma clínica no menu superior para gerenciar
                  pagamentos em criptomoedas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculadora de Conversão Cripto */}
      <CryptoCalculator />

      {/* KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          variant="metric"
          depth="normal"
          className="p-6 border-l-orange-500"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Total em BTC
              </p>
              <p className="text-2xl font-bold truncate">
                {dashboardData.totalBTC.toFixed(8)} BTC
              </p>
            </div>
            <Bitcoin className="h-10 w-10 text-warning opacity-50 shrink-0" />
          </div>
        </Card>

        <Card
          variant="metric"
          depth="normal"
          className="p-6 border-l-green-500"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Total em BRL
              </p>
              <p className="text-2xl font-bold text-success truncate">
                R${" "}
                {dashboardData.totalBRL.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-success opacity-50 shrink-0" />
          </div>
        </Card>

        <Card
          variant="metric"
          depth="normal"
          className="p-6 border-l-yellow-500"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Transações Pendentes
              </p>
              <p className="text-2xl font-bold text-warning truncate">
                {dashboardData.pendingTransactions}
              </p>
            </div>
            <ArrowRightLeft className="h-10 w-10 text-warning opacity-50 shrink-0" />
          </div>
        </Card>

        <Card variant="metric" depth="normal" className="p-6 border-l-blue-500">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Confirmadas Hoje
              </p>
              <p className="text-2xl font-bold truncate">
                {dashboardData.confirmedToday}
              </p>
            </div>
            <Wallet className="h-10 w-10 text-info opacity-50 shrink-0" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="mt-8">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-11">
          <TabsTrigger value="transactions" data-tour="transactions-tab">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="wallets" data-tour="wallets-tab">
            <Wallet className="h-4 w-4 mr-2" />
            Carteiras
          </TabsTrigger>
          <TabsTrigger value="exchanges" data-tour="exchange-tab">
            <Settings className="h-4 w-4 mr-2" />
            Exchanges
          </TabsTrigger>
          <TabsTrigger value="portfolio">
            <Wallet className="h-4 w-4 mr-2" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="technical">
            <Activity className="h-4 w-4 mr-2" />
            Análise Técnica
          </TabsTrigger>
          <TabsTrigger value="simulator">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Simulador
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <TrendingUp className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="comparative">
            <BarChart3 className="h-4 w-4 mr-2" />
            Comparativo
          </TabsTrigger>
          <TabsTrigger value="alerts" data-tour="alerts-tab">
            <Bell className="h-4 w-4 mr-2" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="backtesting">
            <TrendingUp className="h-4 w-4 mr-2" />
            DCA
          </TabsTrigger>
          <TabsTrigger value="volatility">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Volatilidade
          </TabsTrigger>
        </TabsList>

        {/* Global Exchange Dialog */}
        <Dialog open={exchangeDialogOpen} onOpenChange={setExchangeDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configurar Exchange</DialogTitle>
            </DialogHeader>
            <ExchangeConfigForm
              onSubmit={handleExchangeSubmit}
              onCancel={() => setExchangeDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <CryptoTransactionsView
            exchanges={exchanges}
            wallets={wallets}
            transactions={transactions}
            convertingTx={convertingTx}
            setConvertingTx={setConvertingTx}
            setExchangeDialogOpen={setExchangeDialogOpen}
            setWalletDialogOpen={setWalletDialogOpen}
            setQrCodeDialogOpen={setQrCodeDialogOpen}
            convertCryptoToBRL={convertCryptoToBRL}
          />
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <CryptoWalletsView
            exchanges={exchanges}
            wallets={wallets}
            walletDialogOpen={walletDialogOpen}
            setWalletDialogOpen={setWalletDialogOpen}
            setExchangeDialogOpen={setExchangeDialogOpen}
            handleWalletSubmit={handleWalletSubmit}
          />
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <CryptoPortfolioDashboard
            wallets={wallets}
            transactions={transactions}
          />
        </TabsContent>

        {/* Exchanges Tab */}
        <TabsContent value="exchanges" className="space-y-4">
          <CryptoExchangesView
            exchanges={exchanges}
            setExchangeDialogOpen={setExchangeDialogOpen}
          />
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <CryptoAnalysisDashboard clinicId={clinicId || ""} />
        </TabsContent>

        {/* Technical Analysis Tab */}
        <TabsContent value="technical" className="space-y-4">
          <CryptoTechnicalAnalysisView />
        </TabsContent>

        {/* Simulator Tab */}
        <TabsContent value="simulator" className="space-y-4">
          <CryptoSimulatorView />
        </TabsContent>

        {/* Comparative Dashboard Tab */}
        <TabsContent value="comparative" className="space-y-4">
          <CryptoComparativeView transactions={transactions} />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <CryptoAlertsView
            alerts={alerts}
            alertsLoading={alertsLoading}
            cascadeWizardOpen={cascadeWizardOpen}
            setCascadeWizardOpen={setCascadeWizardOpen}
            alertDialogOpen={alertDialogOpen}
            setAlertDialogOpen={setAlertDialogOpen}
            handleCascadeSubmit={handleCascadeSubmit}
            handleAlertSubmit={handleAlertSubmit}
            toggleAlert={toggleAlert}
            deleteAlert={deleteAlert}
          />
        </TabsContent>

        <TabsContent value="backtesting" className="space-y-6">
          <DCABacktesting />
        </TabsContent>

        <TabsContent value="volatility" className="space-y-6">
          <VolatilityAlerts />
        </TabsContent>
      </Tabs>

      <BitcoinQRCodeDialog
        open={qrCodeDialogOpen}
        onOpenChange={setQrCodeDialogOpen}
        wallets={wallets}
        onGeneratePayment={async (data) => {
          return null;
        }}
      />
    </div>
  );
}
