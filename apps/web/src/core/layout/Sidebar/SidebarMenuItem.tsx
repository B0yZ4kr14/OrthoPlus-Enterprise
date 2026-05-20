import { NavLink, useLocation } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@orthoplus/core-ui/collapsible";
import { ChevronDown, Circle } from "lucide-react";
import { useSidebar } from "@orthoplus/core-ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { MenuItem } from "./sidebar.config";
import { Badge } from "@orthoplus/core-ui/badge";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@orthoplus/core-ui/tooltip";

interface SidebarMenuItemProps {
  item: MenuItem;
  isSubItem?: boolean;
  onNavigate?: () => void;
}

export function SidebarMenuItem({
  item,
  isSubItem = false,
  onNavigate,
}: SidebarMenuItemProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const { hasModuleAccess } = useAuth();
  const collapsed = state === "collapsed";

  // Check module access
  const hasAccess = !item.moduleKey || hasModuleAccess(item.moduleKey);
  if (!hasAccess) return null;

  const isActive = (url?: string) => {
    if (!url) return false;
    if (url === "/") return location.pathname === "/";
    if (location.pathname === url) return true;
    return location.pathname.startsWith(`${url}/`);
  };

  const isItemActive = isActive(item.url);
  const IconComponent = item.icon || Circle;

  const handleClick = () => {
    onNavigate?.();
  };

  // Base styles — usa CSS vars para compatibilidade com todos os temas
  const baseClasses = `min-h-[44px] py-2.5 px-3 flex items-center gap-3 transition-all duration-300 ease-out w-full group focus-visible:ring-2 focus-visible:ring-[hsl(var(--interactive))] focus-visible:ring-offset-1 focus-visible:outline-none rounded-xl ${
    isItemActive
      ? "bg-gradient-to-r from-[hsl(var(--accent))]/90 to-[hsl(var(--accent))]/60 border-r-[3px] border-[hsl(var(--interactive))] font-semibold text-[hsl(var(--interactive))] shadow-[0_0_12px_hsl(var(--interactive)/0.15)]"
      : "text-[hsl(var(--sidebar-foreground))] font-medium hover:bg-[hsl(var(--sidebar-accent))]/80 hover:translate-x-0.5"
  }`;

  const subItemClasses = `min-h-[40px] py-2 px-3 pl-8 flex items-center gap-3 transition-all duration-300 ease-out w-full group focus-visible:ring-2 focus-visible:ring-[hsl(var(--interactive))] focus-visible:ring-offset-1 focus-visible:outline-none rounded-xl ${
    isItemActive
      ? "bg-gradient-to-r from-[hsl(var(--accent))]/90 to-[hsl(var(--accent))]/60 border-r-[3px] border-[hsl(var(--interactive))] font-semibold text-[hsl(var(--interactive))] shadow-[0_0_12px_hsl(var(--interactive)/0.15)]"
      : "text-[hsl(var(--muted-foreground))] font-medium hover:bg-[hsl(var(--sidebar-accent))]/80 hover:translate-x-0.5"
  }`;

  const iconClasses = `shrink-0 transition-all duration-300 ${
    isItemActive
      ? "text-[hsl(var(--interactive))] drop-shadow-[0_0_4px_hsl(var(--interactive)/0.4)]"
      : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--interactive))] group-hover:scale-110"
  }`;

  // Menu item with subitems
  if (item.subItems && !isSubItem) {
    const isAnySubItemActive = item.subItems.some((sub) => isActive(sub.url));

    const triggerContent = (
      <CollapsibleTrigger className={baseClasses}>
        <IconComponent className={`${iconClasses} h-4 w-4`} aria-hidden="true" />
        {!collapsed && (
          <>
            <span className="text-sm flex-1 text-left">{item.title}</span>
            <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200 group-data-[state=open]/submenu:rotate-180" aria-hidden="true" />
          </>
        )}
      </CollapsibleTrigger>
    );

    return (
      <Collapsible defaultOpen={isAnySubItemActive} className="group/submenu mb-1">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{triggerContent}</TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        ) : (
          triggerContent
        )}
        <CollapsibleContent className="mt-1 space-y-1">
          {item.subItems.map((subItem) => (
            <SidebarMenuItem
              key={subItem.title}
              item={subItem}
              isSubItem
              onNavigate={onNavigate}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Regular menu item
  const linkContent = (
    <NavLink
      to={item.url || "#"}
      onClick={handleClick}
      className={isSubItem ? subItemClasses : baseClasses}
      aria-current={isItemActive ? "page" : undefined}
    >
      <IconComponent className={`${iconClasses} ${isSubItem ? "h-3.5 w-3.5" : "h-4 w-4"}`} aria-hidden="true" />
      {!collapsed && (
        <>
          <span className={`${isSubItem ? "text-xs" : "text-sm"} flex-1 truncate`} title={item.title}>
            {item.title}
          </span>
          {item.badge && Number(item.badge.count) > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Badge
                variant={item.badge.variant || "default"}
                className="ml-auto text-[10px] h-5 px-1.5"
              >
                {item.badge.count}
              </Badge>
            </motion.span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="mb-1">
      {collapsed && !isSubItem ? (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">{item.title}</TooltipContent>
        </Tooltip>
      ) : (
        linkContent
      )}
    </div>
  );
}
