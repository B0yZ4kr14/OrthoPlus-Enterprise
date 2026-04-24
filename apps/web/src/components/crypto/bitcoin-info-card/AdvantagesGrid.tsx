import { Shield, Zap, Globe, Lock } from "lucide-react";
import { ADVANTAGES } from "./types";

const ICONS = {
  shield: Shield,
  zap: Zap,
  globe: Globe,
  lock: Lock,
};

const ICON_COLORS = {
  shield: "text-blue-500",
  zap: "text-yellow-500",
  globe: "text-green-500",
  lock: "text-purple-500",
};

export function AdvantagesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {ADVANTAGES.map((advantage) => {
        const Icon = ICONS[advantage.icon];
        const colorClass = ICON_COLORS[advantage.icon];

        return (
          <div key={advantage.title} className="p-4 rounded-lg border bg-card/50">
            <Icon className={`h-8 w-8 ${colorClass} mb-3`} />
            <h4 className="font-semibold text-sm mb-2">{advantage.title}</h4>
            <p className="text-xs text-muted-foreground">{advantage.description}</p>
          </div>
        );
      })}
    </div>
  );
}
