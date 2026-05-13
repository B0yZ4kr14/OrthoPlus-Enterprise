import { SidebarHeader as ShadcnSidebarHeader } from "@orthoplus/core-ui/sidebar";
import { useSidebar } from "@orthoplus/core-ui/sidebar";
import orthoLogo from "@/assets/orthoplus-logo-enterprise.svg";

export function SidebarHeader() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <ShadcnSidebarHeader className="border-b border-border/30 bg-gradient-to-b from-sidebar-background/95 to-sidebar-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 dark:bg-[hsl(var(--interactive))]/20 rounded-lg blur-md" />
            <img
              src={orthoLogo}
              alt="OrthoPlus Enterprise"
              className="h-8 w-auto shrink-0 relative transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] dark:hover:drop-shadow-[0_0_12px_hsl(168_45%_52%/0.5)]"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden transition-opacity duration-300">
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight leading-none">
                OrthoPlus
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-2.5 py-0.5 rounded-full w-fit mt-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                Enterprise
              </span>
            </div>
          )}
        </div>
      </div>
    </ShadcnSidebarHeader>
  );
}
