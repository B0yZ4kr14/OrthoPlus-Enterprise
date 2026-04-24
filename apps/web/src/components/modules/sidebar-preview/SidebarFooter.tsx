import { Badge } from "@orthoplus/core-ui/badge";

interface SidebarFooterProps {
  activeCount: number;
}

export function SidebarFooter({ activeCount }: SidebarFooterProps) {
  if (activeCount === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-xs">Nenhum módulo ativo</p>
        <p className="text-[10px] mt-1">Ative módulos para visualizar</p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-border text-center">
      <Badge variant="secondary" className="text-[10px]">
        {activeCount} módulo{activeCount !== 1 ? "s" : ""} ativo
        {activeCount !== 1 ? "s" : ""}
      </Badge>
    </div>
  );
}
