/**
 * AppSidebar Refatorado - FASE 2: Arquitetura DDD
 * Reduzido de 491 linhas para ~50 linhas (componente principal)
 * Componentização modular e reutilizável
 */
import { Sidebar, SidebarContent } from "@orthoplus/core-ui/sidebar";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps = {}) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border/50 backdrop-blur-xl"
    >
      <SidebarHeader />

      <SidebarContent className="overflow-y-auto px-3 pt-4 scrollbar-thin scrollbar-thumb-sidebar-accent/30 scrollbar-track-transparent hover:scrollbar-thumb-sidebar-accent/50">
        <SidebarNav onNavigate={onNavigate} />
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
