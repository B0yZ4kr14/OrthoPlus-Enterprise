// cspell:disable
import { Progress } from "@orthoplus/core-ui/progress";

interface ProgressSectionProps {
  progress: number;
}

export function ProgressSection({ progress }: ProgressSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Executando testes...</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
