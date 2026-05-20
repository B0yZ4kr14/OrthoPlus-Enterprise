import { SidebarFooter as ShadcnSidebarFooter } from "@orthoplus/core-ui/sidebar";
import { useSidebar } from "@orthoplus/core-ui/sidebar";

export function SidebarFooter() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <ShadcnSidebarFooter className="p-4 border-t border-border/30 bg-gradient-to-t from-sidebar-background/90 to-transparent backdrop-blur-xl">
      {!collapsed && (
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--interactive))] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[hsl(var(--interactive))] shadow-[0_0_6px_hsl(var(--interactive)/0.5)]"></span>
            </span>
            <span className="text-xs font-medium text-[hsl(var(--interactive))]">
              Sistema Online
            </span>
          </div>
          <span className="text-[10px] font-mono text-[hsl(var(--sidebar-foreground))]/60">
            v2.9.9
          </span>
        </div>
      )}
    </ShadcnSidebarFooter>
  );
}
