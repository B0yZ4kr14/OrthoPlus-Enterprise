import { SidebarFooter as ShadcnSidebarFooter } from "@orthoplus/core-ui/sidebar";
import { useSidebar } from "@orthoplus/core-ui/sidebar";
import { Badge } from "@orthoplus/core-ui/badge";

export function SidebarFooter() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <ShadcnSidebarFooter className="p-4 border-t border-border/40">
      {!collapsed && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground font-medium flex-1">
              Sistema Online
            </span>
          </div>
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-muted-foreground font-medium">Versão</span>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-secondary/50">
              3.0.0
            </Badge>
          </div>
        </div>
      )}
    </ShadcnSidebarFooter>
  );
}
