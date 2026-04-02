import { Check, AlertTriangle, Key } from 'lucide-react';
import { EngineCard } from '../EngineCard';
import type { EngineType, EngineInfo } from '../../types';

// Component exportado como default para lazy loading

interface MotorTabProps {
  engines: Array<{
    id: EngineType;
    name: string;
    icon: string;
    port: number | null;
    description: string;
  }>;
  selectedEngine: EngineType;
  engineDetails: EngineInfo | null;
  onSelectEngine: (engine: EngineType) => void;
}

export function MotorTab({
  engines,
  selectedEngine,
  engineDetails,
  onSelectEngine,
}: MotorTabProps) {
  return (
    <div className="space-y-6">
      {/* Grid de Motores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {engines.map((engine) => (
          <EngineCard
            key={engine.id}
            {...engine}
            isSelected={selectedEngine === engine.id}
            onClick={() => onSelectEngine(engine.id)}
          />
        ))}
      </div>

      {/* Detalhes do Motor Selecionado */}
      {engineDetails && (
        <div className="bg-card/50 border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <span>{engineDetails.icon}</span>
            {engineDetails.name} - Detalhes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quando Usar */}
            <div>
              <h4 className="text-success font-medium mb-2 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Quando usar:
              </h4>
              <ul className="space-y-1">
                {engineDetails.when_to_use?.map((item, i) => (
                  <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitações */}
            <div>
              <h4 className="text-warning font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Limitações:
              </h4>
              <ul className="space-y-1">
                {engineDetails.limitations?.map((item, i) => (
                  <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                    <span className="text-warning mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recursos */}
          {engineDetails.features && (
            <div className="mt-6">
              <h4 className="text-primary font-medium mb-3 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Recursos:
              </h4>
              <div className="flex flex-wrap gap-2">
                {engineDetails.features.map((feature, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-primary text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MotorTab
