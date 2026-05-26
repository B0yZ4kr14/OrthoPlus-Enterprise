import { cn } from "@/lib/utils"

interface SidebarHoverTriggerProps {
  onMouseEnter: () => void
  onMouseLeave: () => void
  isAutoHide: boolean
}

/**
 * Área invisível na lateral esquerda que ativa a sidebar ao hover.
 * Quando a sidebar está em modo auto-hide, esta faixa exibe um
 * indicador visual premium em neon na borda esquerda.
 */
export function SidebarHoverTrigger({
  onMouseEnter,
  onMouseLeave,
  isAutoHide,
}: SidebarHoverTriggerProps) {
  if (!isAutoHide) return null

  return (
    <div
      data-testid="sidebar-hover-trigger"
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-4",
        "cursor-pointer",
        "transition-all duration-500 ease-out",
        "hover:w-5",
        "hover:bg-gradient-to-r hover:from-sidebar-accent/10 hover:to-transparent"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-hidden="true"
    >
      {/* Faixa de luz neon premium */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[2px]",
          "bg-gradient-to-b from-transparent via-[hsl(var(--interactive))] to-transparent",
          "opacity-60",
          "shadow-[0_0_6px_hsl(var(--interactive)/0.5),0_0_12px_hsl(var(--interactive)/0.3)]",
          "animate-neon-pulse",
          "transition-all duration-500",
          "group-hover:opacity-100 group-hover:shadow-[0_0_10px_hsl(var(--interactive)/0.7),0_0_20px_hsl(var(--interactive)/0.4)]"
        )}
      />
    </div>
  )
}
