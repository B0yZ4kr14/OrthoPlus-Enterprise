import { useState } from "react";
import { ArrowLeftRight, Download, Upload, AlertTriangle, Play } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { useToast } from "@orthoplus/core-hooks";

interface MigrationTabProps {
  selectedEngine: string;
}

const ENGINES = ['PostgreSQL', 'SQLite', 'MariaDB', 'Firebird'];

export function MigrationTab({ selectedEngine }: MigrationTabProps) {
  const { showInfo } = useToast();
  const [targetEngine, setTargetEngine] = useState<string>(
    ENGINES.find(e => e !== selectedEngine) || 'SQLite'
  );

  const handleMigration = () => {
    showInfo(`Migração de ${selectedEngine} para ${targetEngine} iniciada (simulação).`);
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
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-blue-400" />
          Migração de Dados
        </h3>
        <p className="text-sm text-muted-foreground">Exporte e importe dados entre diferentes motores de banco</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-gray-800 bg-gray-900/50 hover:bg-gray-800 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Download className="w-4 h-4 text-green-400" />
              ⬇ Exportar Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Faça download de um dump SQL ou arquivo JSON com todos os registros atuais.
            </p>
            <Button onClick={handleExport} variant="outline" className="w-full border-gray-700 text-gray-300">
              Exportar ({selectedEngine})
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 hover:bg-gray-800 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Upload className="w-4 h-4 text-blue-400" />
              ⬆ Importar Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Restaure um dump anterior ou carregue dados de um banco externo.
            </p>
            <Button onClick={handleImport} variant="outline" className="w-full border-gray-700 text-gray-300">
              Importar Arquivo
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 rounded-xl border border-yellow-600/50 bg-yellow-900/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-4 w-full">
            <div>
              <h4 className="text-sm font-medium text-yellow-500">Migração Assistida</h4>
              <p className="text-sm text-gray-400">
                Migre de forma transparente todos os dados deste módulo de um motor para outro.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <div className="flex-1">
                <span className="text-xs text-gray-500 block mb-1">Origem</span>
                <div className="p-2 rounded bg-black border border-gray-800 text-sm font-medium text-gray-300 text-center">
                  {selectedEngine}
                </div>
              </div>
              
              <ArrowLeftRight className="w-6 h-6 text-gray-600" />
              
              <div className="flex-1">
                <span className="text-xs text-gray-500 block mb-1">Destino</span>
                <select 
                  className="w-full p-2 rounded bg-black border border-gray-800 text-sm font-medium text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  value={targetEngine}
                  onChange={(e) => setTargetEngine(e.target.value)}
                >
                  {ENGINES.filter(e => e !== selectedEngine).map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button onClick={handleMigration} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white border-none">
              <Play className="w-4 h-4 mr-2" /> Iniciar Migração
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
