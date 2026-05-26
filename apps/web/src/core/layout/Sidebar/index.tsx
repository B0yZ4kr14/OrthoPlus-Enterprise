/**
 * AppSidebar Refatorado - FASE 2: Arquitetura DDD
 * Reduzido de 491 linhas para ~50 linhas (componente principal)
 * Componentização modular e reutilizável
 */
import { Sidebar, SidebarContent } from "@orthoplus/core-ui/sidebar"
import { SidebarHeader } from "./SidebarHeader"
import { SidebarNav } from "./SidebarNav"
import { SidebarFooter } from "./SidebarFooter"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  onNavigate?: () => void
  /** Quando true, a sidebar está em modo auto-hide (oculta por padrão) */
  isAutoHide?: boolean
}

export function AppSidebar({ onNavigate, isAutoHide = false }: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "border-r border-border/40 bg-sidebar/95 backdrop-blur-xl",
        "shadow-[2px_0_24px_rgba(0,0,0,0.04)]",
        isAutoHide && "shadow-[4px_0_32px_rgba(0,0,0,0.08)]"
      )}
    >
      <SidebarHeader isAutoHide={isAutoHide} />

      <SidebarContent className="overflow-y-auto px-3 pt-4 scrollbar-thin scrollbar-thumb-sidebar-accent/30 scrollbar-track-transparent hover:scrollbar-thumb-sidebar-accent/50">
        <SidebarNav onNavigate={onNavigate} />
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  )
}
