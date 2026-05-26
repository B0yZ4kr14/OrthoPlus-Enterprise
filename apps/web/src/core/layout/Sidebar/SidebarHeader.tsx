import { SidebarHeader as ShadcnSidebarHeader } from "@orthoplus/core-ui/sidebar"
import { useSidebar } from "@orthoplus/core-ui/sidebar"
import orthoLogo from "@/assets/orthoplus-logo-enterprise.svg"

interface SidebarHeaderProps {
  /** Quando true, a sidebar está em modo auto-hide (oculta por padrão) */
  isAutoHide?: boolean
}

export function SidebarHeader({ isAutoHide = false }: SidebarHeaderProps) {
  const { state } = useSidebar()
  const collapsed = state === "collapsed" && !isAutoHide

  return (
    <ShadcnSidebarHeader className="border-b border-border/30 bg-sidebar-background/95 backdrop-blur-xl transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="relative">
            <img
              src={orthoLogo}
              alt="OrthoPlus Enterprise"
              className="h-8 w-auto shrink-0 relative transition-all duration-300 hover:scale-105"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden transition-opacity duration-300">
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight leading-none">
                OrthoPlus
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-interactive text-interactive-foreground px-2.5 py-0.5 rounded-full w-fit mt-1">
                Enterprise
              </span>
            </div>
          )}
        </div>
      </div>
    </ShadcnSidebarHeader>
  )
}
