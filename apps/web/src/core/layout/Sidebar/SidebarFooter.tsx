import { SidebarFooter as ShadcnSidebarFooter } from "@orthoplus/core-ui/sidebar";
import { useSidebar } from "@orthoplus/core-ui/sidebar";
import { Badge } from "@orthoplus/core-ui/badge";

export function SidebarFooter() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <ShadcnSidebarFooter className="p-4 border-t border-sidebar-border/50">
      {!collapsed && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-sidebar-foreground/60 flex-1">
              Sistema Online
            </span>
          </div>
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-sidebar-foreground/60">Versão</span>
            <Badge variant="secondary" className="text-xs">
              2.0.0
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-xs text-sidebar-foreground/40">© 2025 Ortho+</p>
          </div>
        </div>
      )}
    </ShadcnSidebarFooter>
  );
}
