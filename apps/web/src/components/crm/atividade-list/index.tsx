import type { AtividadeListProps } from "./types";
import { EmptyState } from "./components/EmptyState";
import { AtividadeItem } from "./components/AtividadeItem";

export * from "./types";
export { EmptyState, AtividadeItem };
export { statusLabels, statusColors } from "./constants/status";

export function AtividadeList({ atividades, onConcluir }: AtividadeListProps) {
  if (atividades.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {atividades.map((atividade) => (
        <AtividadeItem
          key={atividade.id}
          atividade={atividade}
          onConcluir={onConcluir}
        />
      ))}
    </div>
  );
}
