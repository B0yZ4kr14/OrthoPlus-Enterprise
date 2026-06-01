import { useState } from "react";
import {
  ArrowLeftRight,
  Download,
  Upload,
  AlertTriangle,
  Play,
} from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { useToast } from "@orthoplus/core-hooks";

interface MigrationTabProps {
  selectedEngine: string;
}

const ENGINES = ["PostgreSQL", "SQLite", "MariaDB", "Firebird"];

export function MigrationTab({ selectedEngine }: MigrationTabProps) {
  const { showInfo } = useToast();
  const [targetEngine, setTargetEngine] = useState<string>(
    ENGINES.find((e) => e !== selectedEngine) || "SQLite",
  );

  const handleMigration = () => {
    showInfo(
      `Migração de ${selectedEngine} para ${targetEngine} iniciada (simulação).`,
    );
  };

  const handleExport = () => {
    showInfo(`Exportando dados de ${selectedEngine} (simulação).`);
  };

  const handleImport = () => {
    showInfo(`Iniciando rotina de importação (simulação).`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-interactive" />
          Migração de Dados
        </h3>
        <p className="text-sm text-muted-foreground">
          Exporte e importe dados entre diferentes motores de banco
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-border bg-card hover:bg-muted transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Download className="w-4 h-4 text-success" />⬇ Exportar Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Faça download de um dump SQL ou arquivo JSON com todos os
              registros atuais.
            </p>
            <Button type="button"
              onClick={handleExport}
              variant="outline"
              className="w-full border-border text-foreground"
            >
              Exportar ({selectedEngine})
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card hover:bg-muted transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Upload className="w-4 h-4 text-info" />⬆ Importar Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Restaure um dump anterior ou carregue dados de um banco externo.
            </p>
            <Button type="button"
              onClick={handleImport}
              variant="outline"
              className="w-full border-border text-foreground"
            >
              Importar Arquivo
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 rounded-xl border border-warning/30 bg-warning/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="space-y-4 w-full">
            <div>
              <h4 className="text-sm font-medium text-warning">
                Migração Assistida
              </h4>
              <p className="text-sm text-muted-foreground">
                Migre de forma transparente todos os dados deste módulo de um
                motor para outro.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg border border-border">
              <div className="flex-1">
                <span className="text-xs text-muted-foreground block mb-1">
                  Origem
                </span>
                <div className="p-2 rounded bg-background border border-border text-sm font-medium text-foreground text-center">
                  {selectedEngine}
                </div>
              </div>

              <ArrowLeftRight className="w-6 h-6 text-muted-foreground" />

              <div className="flex-1">
                <span className="text-xs text-muted-foreground block mb-1">
                  Destino
                </span>
                <select
                  className="w-full p-2 rounded bg-background border border-border text-sm font-medium text-foreground focus:outline-none focus:border-interactive focus:ring-1 focus:ring-interactive"
                  value={targetEngine}
                  onChange={(e) => setTargetEngine(e.target.value)}
                >
                  {ENGINES.filter((e) => e !== selectedEngine).map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="button"
              onClick={handleMigration}
              className="w-full bg-interactive hover:bg-interactive/90 text-white border-none"
            >
              <Play className="w-4 h-4 mr-2" /> Iniciar Migração
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
