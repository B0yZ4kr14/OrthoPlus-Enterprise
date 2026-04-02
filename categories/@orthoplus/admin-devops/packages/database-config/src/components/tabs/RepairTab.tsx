import { Play, Loader2, Trash2, Activity } from 'lucide-react';
import { Button } from '@orthoplus/core-ui/button';
import type { EngineType, MaintenanceTool, ConnectionHistoryEntry } from '../../types';

interface RepairTabProps {
  selectedEngine: EngineType;
  engines: Array<{ id: EngineType; name: string }>;
  maintenanceTools: MaintenanceTool[];
  history: ConnectionHistoryEntry[];
  isLoading: boolean;
  executing: string | null;
  onExecute: (tool: MaintenanceTool) => void;
  onClearHistory: () => void;
}

export function RepairTab({
  selectedEngine,
  engines,
  maintenanceTools,
  history,
  isLoading,
  executing,
  onExecute,
  onClearHistory,
}: RepairTabProps) {
  const engineName = engines.find(e => e.id === selectedEngine)?.name || selectedEngine;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Ferramentas de manutenção e reparo para {engineName}
      </p>

      {/* Ferramentas de Manutenção */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {maintenanceTools.map((tool, index) => (
          <div key={index} className="bg-card/50 border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-warning font-semibold">{tool.name}</h4>
                <p className="text-muted-foreground text-sm mt-1">{tool.description}</p>
              </div>
              <Button
                onClick={() => onExecute(tool)}
                disabled={isLoading || executing !== null}
                size="icon"
                variant="secondary"
                aria-label={`Executar ${tool.name}`}
              >
                {executing === tool.name ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>
            </div>
            <code className="block bg-black/50 rounded px-3 py-2 text-primary text-sm font-mono overflow-x-auto">
              {tool.sql}
            </code>
          </div>
        ))}
      </div>

      {/* Histórico */}
      <div className="bg-card/30 border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Histórico de Conexões</h4>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-destructive hover:text-destructive/80 text-sm flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 text-muted-foreground">
              <Activity className="w-full h-full" />
            </div>
            <p className="text-muted-foreground">Nenhum histórico de conexão disponível</p>
            <p className="text-muted-foreground text-sm mt-1">Execute um teste de conexão para começar</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-card/50 rounded-lg"
              >
                <div>
                  <p className="text-sm">{new Date(entry.timestamp).toLocaleString()}</p>
                  <p className="text-muted-foreground text-xs">{entry.engine} • {entry.database}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  entry.status === 'success' 
                    ? 'bg-success/20 text-success' 
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {entry.status === 'success' ? '✓ OK' : '✗ Erro'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RepairTab
