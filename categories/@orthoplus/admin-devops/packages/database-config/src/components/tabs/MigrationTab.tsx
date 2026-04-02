import { Download, Upload, ArrowRightLeft, Loader2 } from 'lucide-react';
import { Button } from '@orthoplus/core-ui/button';
import type { EngineType } from '../../types';

interface MigrationTabProps {
  engines: Array<{ id: EngineType; name: string }>;
  migrationSource: EngineType;
  setMigrationSource: (engine: EngineType) => void;
  migrationTarget: EngineType;
  setMigrationTarget: (engine: EngineType) => void;
  isLoading: boolean;
  onExport: () => void;
  onImport: () => void;
  onMigrate: () => void;
}

export function MigrationTab({
  engines,
  migrationSource,
  setMigrationSource,
  migrationTarget,
  setMigrationTarget,
  isLoading,
  onExport,
  onImport,
  onMigrate,
}: MigrationTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Exporte e importe dados entre diferentes motores de banco
      </p>

      {/* Botões Exportar/Importar */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onExport}
          disabled={isLoading}
          className="p-6 bg-card/50 border border-border hover:border-primary/50 rounded-xl text-center transition-colors disabled:opacity-50"
        >
          <Download className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h4 className="font-semibold">Exportar Dados</h4>
          <p className="text-muted-foreground text-sm mt-1">JSON/SQL</p>
        </button>

        <button
          onClick={onImport}
          className="p-6 bg-card/50 border border-border hover:border-primary/50 rounded-xl text-center transition-colors"
        >
          <Upload className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h4 className="font-semibold">Importar Dados</h4>
          <p className="text-muted-foreground text-sm mt-1">De outro banco</p>
        </button>
      </div>

      {/* Migração Assistida */}
      <div className="bg-card/50 border border-border rounded-xl p-6">
        <h4 className="text-warning font-semibold mb-2">Migração Assistida</h4>
        <p className="text-muted-foreground text-sm mb-4">
          Transfira dados automaticamente de um motor para outro mantendo integridade referencial.
        </p>

        <div className="flex items-center gap-4 mb-4">
          <select
            value={migrationSource}
            onChange={(e) => setMigrationSource(e.target.value as EngineType)}
            className="flex-1 bg-background border border-border rounded-lg px-4 py-3 focus:border-primary focus:outline-none"
          >
            {engines.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          
          <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
          
          <select
            value={migrationTarget}
            onChange={(e) => setMigrationTarget(e.target.value as EngineType)}
            className="flex-1 bg-background border border-border rounded-lg px-4 py-3 focus:border-primary focus:outline-none"
          >
            {engines.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={onMigrate}
          disabled={isLoading || migrationSource === migrationTarget}
          className="w-full"
          variant={migrationSource === migrationTarget ? "secondary" : "default"}
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
          Iniciar Migração
        </Button>
        
        {migrationSource === migrationTarget && (
          <p className="text-warning text-sm mt-2 text-center">
            Selecione motores diferentes para migrar
          </p>
        )}
      </div>
    </div>
  );
}

export default MigrationTab
