import { Settings } from "lucide-react";

export function AdminSection() {
  return (
    <div className="pt-4 mt-4 border-t border-border/20">
      <div className="space-y-1">
        <div className="px-2 py-1">
          <span className="text-[10px] font-medium text-sidebar-foreground/70 uppercase tracking-wider">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50 text-sidebar-accent-foreground">
          <Settings className="h-4 w-4 shrink-0" />
          <span className="text-xs font-medium truncate">Configurações</span>
        </div>
      </div>
    </div>
  );
}
