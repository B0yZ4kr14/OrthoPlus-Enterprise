import { Sparkles } from "lucide-react";

export function RoadmapHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/15 shadow-lg border-2 border-primary/40">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground">
          Roadmap de Adoção Inteligente
        </h3>
        <p className="text-sm text-muted-foreground">
          Sequência recomendada baseada em análise IA do perfil da sua clínica
        </p>
      </div>
    </div>
  );
}
