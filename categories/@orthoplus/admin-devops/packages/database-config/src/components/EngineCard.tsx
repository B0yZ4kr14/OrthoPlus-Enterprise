import { Check } from 'lucide-react';
import type { EngineType } from '../types';

interface EngineCardProps {
  id: EngineType;
  name: string;
  icon: string;
  port: number | null;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

export function EngineCard({
  id: _id,
  name,
  icon,
  port,
  description,
  isSelected,
  onClick,
}: EngineCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card/50 hover:border-border/80'
      }`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      <div className="flex items-start gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          {port && (
            <p className="text-sm text-muted-foreground">Porta: {port}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </div>
      </div>
    </button>
  );
}
