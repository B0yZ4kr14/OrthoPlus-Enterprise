// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { RefreshCcw, Trash2 } from "lucide-react";
import type { BancoConfig } from "./types";

interface ConfigListProps {
  configs: BancoConfig[];
  loading: boolean;
  onEdit: (config: BancoConfig) => void;
  onSync: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConfigList({
  configs,
  loading,
  onEdit,
  onSync,
  onDelete,
}: ConfigListProps) {
  return (
    <div className="grid gap-4">
      {configs.map((config) => (
        <Card key={config.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{config.banco_nome}</h4>
              <p className="text-sm text-muted-foreground">
                Agência: {config.agencia} | Conta: {config.conta}
              </p>
              {config.ultima_sincronizacao && (
                <p className="text-xs text-muted-foreground mt-1">
                  Última sincronização:{" "}
                  {new Date(config.ultima_sincronizacao).toLocaleString(
                    "pt-BR",
                  )}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => config.id && onSync(config.id)}
                disabled={loading}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(config)}
              >
                Editar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => config.id && onDelete(config.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
