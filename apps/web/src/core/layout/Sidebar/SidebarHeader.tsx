import { SidebarHeader as ShadcnSidebarHeader } from "@orthoplus/core-ui/sidebar";
import { useSidebar } from "@orthoplus/core-ui/sidebar";
import orthoLogo from "@/assets/ortho-logo-main.png";

export function SidebarHeader() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <ShadcnSidebarHeader className="border-b border-border/40 transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center gap-3 px-2">
          <img
            src={orthoLogo}
            alt="Ortho+"
            className="h-8 w-auto shrink-0 transition-transform duration-300 hover:scale-105"
          />
          {!collapsed && (
            <div className="flex flex-col overflow-hidden transition-opacity duration-300">
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight leading-none">
                Ortho+
              </span>
              <span className="text-xs text-muted-foreground font-medium mt-0.5">
                Enterprise
              </span>
            </div>
          )}
        </div>
      </div>
    </ShadcnSidebarHeader>
  );
}
