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

  // Base styles
  const baseClasses = `rounded-lg px-3 py-2 flex items-center gap-3 transition-colors duration-150 w-full group ${
    isItemActive
      ? "bg-interactive/10 text-interactive font-semibold border-l-2 border-interactive"
      : "text-sidebar-foreground/70 font-medium hover:bg-interactive/10 hover:text-interactive"
  }`;

  const subItemClasses = `rounded-lg pl-7 pr-3 py-1.5 flex items-center gap-3 transition-colors duration-150 w-full group ${
    isItemActive
      ? "bg-interactive/10 text-interactive font-semibold border-l-2 border-interactive"
      : "text-sidebar-foreground/70 font-medium hover:bg-interactive/10 hover:text-interactive"
  }`;

  const iconClasses = `shrink-0 ${
    isItemActive
      ? "text-interactive"
      : "text-sidebar-foreground/50 group-hover:text-interactive"
  }`;

  // Menu item with subitems
  if (item.subItems && !isSubItem) {
    // Check if any subitem is active to potentially open the collapsible or highlight parent
    const isAnySubItemActive = item.subItems.some((sub) => isActive(sub.url));
    
    return (
      <Collapsible defaultOpen={isAnySubItemActive} className="group/submenu mb-1">
        <CollapsibleTrigger className={baseClasses}>
          <IconComponent className={`${iconClasses} h-4 w-4`} />
          {!collapsed && (
            <>
              <span className="text-sm flex-1 text-left">{item.title}</span>
              <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200 group-data-[state=open]/submenu:rotate-180" />
            </>
          )}
        </CollapsibleTrigger>
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
  return (
    <div className="mb-1">
      <NavLink
        to={item.url || "#"}
        onClick={handleClick}
        className={isSubItem ? subItemClasses : baseClasses}
      >
        <IconComponent className={`${iconClasses} ${isSubItem ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        {!collapsed && (
          <>
            <span className={`${isSubItem ? "text-xs" : "text-sm"} flex-1 truncate`}>
              {item.title}
            </span>
            {item.badge && Number(item.badge.count) > 0 && (
              <Badge
                variant={item.badge.variant || "default"}
                className="ml-auto text-[10px] h-5 px-1.5"
              >
                {item.badge.count}
              </Badge>
            )}
          </>
        )}
      </NavLink>
    </div>
  );
}
