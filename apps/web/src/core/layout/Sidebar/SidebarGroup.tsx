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
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations";

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
    if (!item.moduleKey) return true;
    return hasModuleAccess(item.moduleKey);
  });

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <ShadcnSidebarGroup className="space-y-1 py-2">
      {group.label !== "VISÃO GERAL" && !collapsed && (
        <SidebarGroupLabel className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-widest uppercase text-slate-400 dark:text-[hsl(var(--muted-foreground))]">
          {group.label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {visibleItems.map((item) => (
              <motion.div key={item.title} variants={fadeUp}>
                <ShadcnSidebarMenuItem>
                  <SidebarMenuItem item={item} onNavigate={onNavigate} />
                </ShadcnSidebarMenuItem>
              </motion.div>
            ))}
          </motion.div>
        </SidebarMenu>
      </SidebarGroupContent>
    </ShadcnSidebarGroup>
  );
}
