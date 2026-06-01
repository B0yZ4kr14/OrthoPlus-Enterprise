import { Card } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import { Wallet, Plus, Info, Settings } from "lucide-react";
import { WalletForm } from "@/components/crypto/WalletForm";
import { WalletQRPreview } from "@/components/crypto/WalletQRPreview";
import {
  CryptoWallet,
  ExchangeConfig,
} from "@/modules/crypto/types/crypto.types";

export interface CryptoWalletsViewProps {
  exchanges: ExchangeConfig[];
  wallets: CryptoWallet[];
  walletDialogOpen: boolean;
  setWalletDialogOpen: (open: boolean) => void;
  setExchangeDialogOpen: (open: boolean) => void;
  handleWalletSubmit: (data: any) => Promise<void>;
}

export function CryptoWalletsView({
  exchanges,
  wallets,
  walletDialogOpen,
  setWalletDialogOpen,
  setExchangeDialogOpen,
  handleWalletSubmit,
}: CryptoWalletsViewProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Carteiras Configuradas</h3>
        <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={exchanges.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Carteira
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Carteira</DialogTitle>
            </DialogHeader>
            <WalletForm
              onSubmit={handleWalletSubmit}
              onCancel={() => setWalletDialogOpen(false)}
              exchanges={exchanges}
            />
          </DialogContent>
        </Dialog>
      </div>

      {exchanges.length === 0 ? (
        <Card depth="normal" className="p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-warning/10 p-6">
                <Info className="h-12 w-12 text-warning" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                Configure uma exchange primeiro
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Antes de criar carteiras, você precisa configurar pelo menos uma
                exchange para sincronização.
              </p>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-4">
                <strong>Por que vincular a uma exchange?</strong> A vinculação
                permite sincronização automática de saldos, confirmações de
                transações e cotações em tempo real.
              </p>
            </div>
            <div className="flex justify-center">
              <Button type="button" onClick={() => setExchangeDialogOpen(true)} size="lg">
                <Settings className="h-5 w-5 mr-2" />
                Configurar Exchange
              </Button>
            </div>
          </div>
        </Card>
      ) : wallets.length === 0 ? (
        <Card depth="normal" className="p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-warning/10 p-6">
                <Wallet className="h-12 w-12 text-warning" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                Nenhuma carteira configurada
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Crie uma carteira para receber pagamentos em Bitcoin, Ethereum
                ou outras criptomoedas.
              </p>
            </div>
            <div className="flex justify-center">
              <Button type="button"
                onClick={() => setWalletDialogOpen(true)}
                size="lg"
                className="bg-warning hover:bg-warning"
              >
                <Plus className="h-5 w-5 mr-2" />
                Criar Carteira
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <WalletQRPreview key={wallet.id} wallet={wallet} />
          ))}
        </div>
      )}
    </>
  );
}
