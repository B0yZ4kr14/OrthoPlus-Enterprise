import { ReactNode, useState, memo, useMemo } from "react"
import { SidebarProvider } from "@orthoplus/core-ui/sidebar"
import { AppSidebar } from "@/core/layout/Sidebar"
import { SidebarHoverTrigger } from "@/core/layout/Sidebar/SidebarHoverTrigger"
import { DashboardHeader } from "@/components/DashboardHeader"
import { GlobalSearch } from "@/components/layout/GlobalSearch"
import { Sheet, SheetContent } from "@orthoplus/core-ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFocusMode } from "@/hooks/useFocusMode"
import { useSidebarHover } from "@/hooks/useSidebarHover"
import { SkipLink } from "@/components/SkipLink"
import { cn } from "@/lib/utils"

interface AppLayoutInnerProps {
  children: ReactNode
  isMobile: boolean
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  isFocusMode: boolean
}

/**
 * Componente interno que renderiza DENTRO do SidebarProvider.
 * Necessário porque useSidebarHover consome o contexto useSidebar.
 */
const AppLayoutInner = memo(function AppLayoutInner({
  children,
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen,
  isFocusMode,
}: AppLayoutInnerProps) {
  const {
    isOpen: sidebarOpen,
    isAutoHide,
    onMouseEnter,
    onMouseLeave,
  } = useSidebarHover()

  const contentClassName = useMemo(
    () =>
      `flex-1 bg-background overflow-x-hidden transition-all duration-300 ease-out ${isFocusMode ? "p-3 md:p-5" : "p-5 md:p-8"}`,
    [isFocusMode],
  )

  return (
    <>
      <SkipLink />
      <div className="flex min-h-screen w-full bg-background">
        {/* Trigger de hover — só aparece no desktop em modo auto-hide */}
        {!isMobile && !isFocusMode && (
          <SidebarHoverTrigger
            isAutoHide={isAutoHide}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        )}

        {/* Sidebar desktop */}
        {!isMobile && !isFocusMode && (
          <nav
            data-tour="sidebar"
            className={cn(
              "fixed inset-y-0 left-0 z-20 transition-transform duration-300 ease-out",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            aria-hidden={!sidebarOpen}
          >
            <AppSidebar isAutoHide={isAutoHide} />
          </nav>
        )}

        {/* Sidebar mobile (Sheet) — inalterado */}
        {isMobile && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-[280px] p-0 border-r border-border">
              <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        )}

        {/* Conteúdo principal — sem margem fixa quando sidebar está oculta */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-out",
            isFocusMode && "ml-0"
          )}
        >
          {(!isFocusMode || isMobile) && (
            <header className="transition-all duration-300 ease-out">
              <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
            </header>
          )}

          <main id="main-content" className={contentClassName}>
            {isFocusMode && !isMobile && (
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 border border-border/50 px-4 py-2 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-interactive animate-pulse" />
                <span>Modo Foco Ativo</span>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
      <GlobalSearch />
    </>
  )
})

interface AppLayoutProps {
  children: ReactNode
}

export const AppLayout = memo(function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isFocusMode } = useFocusMode({ enabled: true, timeout: 3000 })

  return (
    <SidebarProvider defaultOpen={true}>
      <AppLayoutInner
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isFocusMode={isFocusMode}
      >
        {children}
      </AppLayoutInner>
    </SidebarProvider>
  )
})
