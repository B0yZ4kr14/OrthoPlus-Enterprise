import { FileText } from 'lucide-react';
import type { EngineType } from '../../types';
import { DEFAULT_CONFIGS } from '../../constants';

interface TemplatesTabProps {
  engines: Array<{ id: EngineType; name: string; icon: string }>;
  onApplyTemplate: (engine: EngineType) => void;
}

export function TemplatesTab({
  engines,
  onApplyTemplate,
}: TemplatesTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Templates de configuração pré-definidos</p>
      
      <div className="grid grid-cols-1 gap-4">
        {engines.map((engine) => {
          const defaultConfig = DEFAULT_CONFIGS[engine.id];
          
          return (
            <div key={engine.id} className="bg-card/50 border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{engine.icon}</span>
                  <div>
                    <h4 className="font-semibold">{engine.name}</h4>
                    <p className="text-muted-foreground text-sm">
                      {engine.id === 'sqlite' 
                        ? defaultConfig.file_path 
                        : `${defaultConfig.host}:${defaultConfig.port} / ${defaultConfig.database}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onApplyTemplate(engine.id)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Templates SQL */}
      <div className="mt-8">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Templates SQL para PostgreSQL
        </h4>
        
        <div className="space-y-4">
          <div className="bg-card/50 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-warning font-medium">Tabela de Configurações</h5>
              <button className="text-primary text-sm hover:underline">Copiar</button>
            </div>
            <code className="block bg-black/50 rounded-lg px-4 py-3 text-primary text-sm font-mono overflow-x-auto">
{`CREATE TABLE configurations (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
            </code>
          </div>

          <div className="bg-card/50 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-warning font-medium">Tabela de Logs</h5>
              <button className="text-primary text-sm hover:underline">Copiar</button>
            </div>
            <code className="block bg-black/50 rounded-lg px-4 py-3 text-primary text-sm font-mono overflow-x-auto">
{`CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplatesTab
