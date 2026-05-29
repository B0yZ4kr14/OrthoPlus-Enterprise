import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { WifiOff, Trash2 } from "lucide-react";
import type { HardwareWallet } from "./types";

interface WalletListProps {
  wallets: HardwareWallet[];
  onRemove: (id: string) => void;
}

export function WalletList({ wallets, onRemove }: WalletListProps) {
  if (wallets.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carteiras Configuradas</CardTitle>
        <CardDescription>
          {wallets.length} carteira{wallets.length > 1 ? "s" : ""} offline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <WifiOff className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{wallet.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {wallet.type.toUpperCase()}
                    </Badge>
                    {wallet.multisig && (
                      <Badge variant="secondary" className="text-xs">
                        Multi-Sig
                      </Badge>
                    )}
                    {wallet.fingerprint && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {wallet.fingerprint}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(wallet.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
