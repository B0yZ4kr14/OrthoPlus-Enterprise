// cspell:disable
import {
  Bitcoin,
  Wallet,
  TrendingUp,
  ArrowRightLeft,
  Settings,
  Activity,
  Bell,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
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
} from "@orthoplus/core-ui/dialog";
import { Card } from "@orthoplus/core-ui/card";
import { NotificationBadge } from "./NotificationBadge";
import { BitcoinInfoSection } from "./BitcoinInfoSection";
import { ClinicWarning } from "./ClinicWarning";
import { CryptoCalculator } from "@financeiro/components/crypto-calculator";
import { ExchangeConfigForm } from "@financeiro/components/crypto-exchange";
import { CryptoWalletsView } from "@financeiro/components/crypto-wallets";
import { CryptoTransactionsView } from "@financeiro/components/crypto-transactions";
import { CryptoExchangesView } from "@financeiro/components/crypto-exchanges";
import { CryptoPortfolioDashboard } from "@financeiro/components/crypto-portfolio";
import { CryptoAnalysisDashboard } from "@financeiro/components/crypto-analysis";
import { CryptoTechnicalAnalysisView } from "@financeiro/components/crypto-technical-analysis";
import { CryptoSimulatorView } from "@financeiro/components/crypto-simulator";
import { CryptoComparativeView } from "@financeiro/components/crypto-comparative";
import { CryptoAlertsView } from "@financeiro/components/crypto-alerts";
import { BitcoinQRCodeDialog } from "@financeiro/components/bitcoin-qr-code";
import { DCABacktesting } from "@financeiro/components/dca-backtesting";
import { VolatilityAlerts } from "@financeiro/components/volatility-alerts";
import { useCryptoPagamentos } from "./useCryptoPagamentos";

export function CryptoPagamentos() {
  const {
    clinicId,
    dashboardData,
    exchanges,
    wallets,
    transactions,
    convertingTx,
    setConvertingTx,
    alerts,
    alertsLoading,
    exchangeDialogOpen,
    setExchangeDialogOpen,
    walletDialogOpen,
    setWalletDialogOpen,
    qrCodeDialogOpen,
    setQrCodeDialogOpen,
    alertDialogOpen,
    setAlertDialogOpen,
    cascadeWizardOpen,
    setCascadeWizardOpen,
    convertCryptoToBRL,
    handleWalletSubmit,
    handleExchangeSubmit,
    handleAlertSubmit,
    handleCascadeSubmit,
    toggleAlert,
    deleteAlert,
  } = useCryptoPagamentos();

  if (!clinicId) {
    return <ClinicWarning />;
  }

  return (
    <div className="space-y-6">
      {/* Bitcoin Info Section */}
      <BitcoinInfoSection />

      {/* Notification Badge */}
      <NotificationBadge count={dashboardData.pendingTransactions} />

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
            <Bitcoin className="h-10 w-10 text-warning opacity-20 shrink-0" />
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
            <TrendingUp className="h-10 w-10 text-success opacity-20 shrink-0" />
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
            <ArrowRightLeft className="h-10 w-10 text-warning opacity-20 shrink-0" />
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
            <Wallet className="h-10 w-10 text-info opacity-20 shrink-0" />
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
        onGeneratePayment={async () => null}
      />
    </div>
  );
}

export default CryptoPagamentos;
