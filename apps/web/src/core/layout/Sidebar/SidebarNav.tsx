import {
  SidebarGroup as ShadcnSidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem as ShadcnSidebarMenuItem,
} from "@orthoplus/core-ui/sidebar";
import { useSidebar } from "@orthoplus/core-ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { menuGroups, adminMenuItems } from "./sidebar.config";
import { Separator } from "@orthoplus/core-ui/separator";
import { useSidebarBadges } from "@/hooks/useSidebarBadges";
import { useMemo } from "react";

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps = {}) {
  const { state } = useSidebar();
  const { isAdmin } = useAuth();
  const collapsed = state === "collapsed";
  const { data: badges } = useSidebarBadges();

  const enrichedGroups = useMemo(() => {
    return menuGroups.map(group => ({
      ...group,
      items: group.items.map(item => {
        const enrichedItem = { ...item };
        
        if (badges) {
          if (enrichedItem.url === "/agenda") {
            enrichedItem.badge = { count: badges.appointments, variant: "default" };
          } else if (enrichedItem.url === "/financeiro/receber") {
            enrichedItem.badge = { count: badges.overdue, variant: "destructive" };
          } else if (enrichedItem.url === "/inadimplencia") {
            enrichedItem.badge = { count: badges.defaulters, variant: "destructive" };
          } else if (enrichedItem.url === "/recall") {
            enrichedItem.badge = { count: badges.recalls, variant: "default" };
          }
        }
        
        return enrichedItem;
      })
    }));
  }, [badges]);

  return (
    <div className="pb-6 flex flex-col">
      {enrichedGroups.map((group, index) => (
        <SidebarGroup
          key={group.label}
          group={group}
          index={index}
          onNavigate={onNavigate}
        />
      ))}

      {isAdmin && (
        <>
          <Separator className="my-2 bg-border/40 w-[calc(100%-2rem)] mx-auto" />
          <ShadcnSidebarGroup className="space-y-1 py-2">
            {!collapsed && (
              <SidebarGroupLabel className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/60">
                ADMINISTRAÇÃO
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <ShadcnSidebarMenuItem key={item.title}>
                    <SidebarMenuItem item={item} onNavigate={onNavigate} />
                  </ShadcnSidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </ShadcnSidebarGroup>
        </>
      )}
    </div>
  );
}
