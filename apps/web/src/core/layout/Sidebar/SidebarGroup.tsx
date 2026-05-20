import {
  SidebarGroup as ShadcnSidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem as ShadcnSidebarMenuItem,
} from "@orthoplus/core-ui/sidebar";
import { useSidebar } from "@orthoplus/core-ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebarCategory } from "@/contexts/SidebarCategoryContext";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { MenuGroup } from "./sidebar.config";
import { motion, AnimatePresence } from "framer-motion";
import {
  staggerContainer,
  fadeUp,
  categoryContent,
  categoryItem,
  chevronRotate,
} from "@/lib/animations";
import { ChevronDown } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

interface SidebarGroupProps {
  group: MenuGroup;
  index: number;
  onNavigate?: () => void;
}

export function SidebarGroup({ group, onNavigate }: SidebarGroupProps) {
  const { state } = useSidebar();
  const { hasModuleAccess } = useAuth();
  const { isExpanded, toggleGroup } = useSidebarCategory();
  const { pathname } = useLocation();
  const collapsed = state === "collapsed";

  const visibleItems = (group.items || []).filter((item) => {
    if (!item.moduleKey) return true;
    return hasModuleAccess(item.moduleKey);
  });

  const isGroupExpanded = isExpanded(group.boundedContext);

  const isActiveGroup = useMemo(() => {
    return visibleItems.some((item) =>
      item.url ? pathname.startsWith(item.url) : false,
    );
  }, [visibleItems, pathname]);

  const handleToggle = useCallback(() => {
    toggleGroup(group.boundedContext);
  }, [toggleGroup, group.boundedContext]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
  );

  if (visibleItems.length === 0) {
    return null;
  }

  const showHeader =
    group.label !== "VISÃO GERAL" && !collapsed && visibleItems.length > 0;

  return (
    <ShadcnSidebarGroup className="space-y-1 py-2">
      {showHeader && (
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className="flex w-full items-center justify-between px-3 pt-4 pb-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md"
          aria-expanded={isGroupExpanded}
          aria-controls={`sidebar-group-${group.boundedContext}`}
        >
          <SidebarGroupLabel className="px-0 pt-0 pb-0 text-[11px] font-semibold tracking-widest uppercase text-[hsl(var(--sidebar-foreground))]/60 cursor-pointer select-none">
            {group.label}
          </SidebarGroupLabel>
          <motion.span
            variants={chevronRotate}
            initial="collapsed"
            animate={isGroupExpanded ? "expanded" : "collapsed"}
            className="text-[hsl(var(--sidebar-foreground))]/60"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
        </button>
      )}

      <AnimatePresence initial={false}>
        {isGroupExpanded && (
          <motion.div
            id={`sidebar-group-${group.boundedContext}`}
            variants={categoryContent}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ overflow: "hidden" }}
          >
            <SidebarGroupContent>
              <SidebarMenu>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {visibleItems.map((item) => (
                    <motion.div
                      key={item.title}
                      variants={categoryItem}
                    >
                      <ShadcnSidebarMenuItem>
                        <SidebarMenuItem
                          item={item}
                          onNavigate={onNavigate}
                        />
                      </ShadcnSidebarMenuItem>
                    </motion.div>
                  ))}
                </motion.div>
              </SidebarMenu>
            </SidebarGroupContent>
          </motion.div>
        )}
      </AnimatePresence>

      {(group.label === "VISÃO GERAL" || collapsed) && (
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
                    <SidebarMenuItem
                      item={item}
                      onNavigate={onNavigate}
                    />
                  </ShadcnSidebarMenuItem>
                </motion.div>
              ))}
            </motion.div>
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </ShadcnSidebarGroup>
  );
}
