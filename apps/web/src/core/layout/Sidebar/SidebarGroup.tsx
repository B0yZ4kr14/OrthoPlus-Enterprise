import {
  SidebarGroup as ShadcnSidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem as ShadcnSidebarMenuItem,
} from "@orthoplus/core-ui/sidebar";
import { useSidebar } from "@orthoplus/core-ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { MenuGroup } from "./sidebar.config";

interface SidebarGroupProps {
  group: MenuGroup;
  index: number;
  onNavigate?: () => void;
}

export function SidebarGroup({ group, onNavigate }: SidebarGroupProps) {
  const { state } = useSidebar();
  const { hasModuleAccess } = useAuth();
  const collapsed = state === "collapsed";

  // Filter items based on module access
  const visibleItems = (group.items || []).filter((item) => {
    // If no moduleKey, item is always visible
    if (!item.moduleKey) return true;
    // Check if user has access to this module
    return hasModuleAccess(item.moduleKey);
  });

  // Don't render group if no visible items
  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <ShadcnSidebarGroup className="space-y-1 py-2">
      {group.label !== "VISÃO GERAL" && !collapsed && (
        <SidebarGroupLabel className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/60">
          {group.label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => (
            <ShadcnSidebarMenuItem key={item.title}>
              <SidebarMenuItem item={item} onNavigate={onNavigate} />
            </ShadcnSidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </ShadcnSidebarGroup>
  );
}
