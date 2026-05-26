import { cn } from "@/lib/utils"

interface SidebarHoverTriggerProps {
  onMouseEnter: () => void
  onMouseLeave: () => void
  isAutoHide: boolean
}

/**
 * Área invisível na lateral esquerda que ativa a sidebar ao hover.
 * Quando a sidebar está em modo auto-hide, esta faixa fica
 * disponível para o usuário passar o mouse e revelar a sidebar.
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
        "fixed inset-y-0 left-0 z-30 w-3",
        "cursor-pointer",
        "transition-opacity duration-300",
        "hover:bg-gradient-to-r hover:from-sidebar-accent/20 hover:to-transparent"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-hidden="true"
    >
      {/* Indicador sutil na borda — linha vertical de 2px */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[2px]",
          "bg-gradient-to-b from-transparent via-sidebar-border/40 to-transparent",
          "transition-opacity duration-300"
        )}
      />
    </div>
  )
}
