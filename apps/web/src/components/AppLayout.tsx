import { ReactNode, useState, memo, useMemo } from "react";
import { SidebarProvider } from "@orthoplus/core-ui/sidebar";
import { AppSidebar } from "@/core/layout/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { Sheet, SheetContent } from "@orthoplus/core-ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFocusMode } from "@/hooks/useFocusMode";
import { SkipLink } from "@/components/SkipLink";
import { SidebarCategoryProvider } from "@/contexts/SidebarCategoryContext";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = memo(function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isFocusMode } = useFocusMode({ enabled: true, timeout: 3000 });

  const contentClassName = useMemo(
    () =>
      `flex-1 bg-background overflow-x-hidden transition-all duration-300 ease-out ${isFocusMode ? "p-2 md:p-4" : "p-4 md:p-6"}`,
    [isFocusMode],
  );

  return (
    <SidebarProvider>
      <SkipLink />
      <div className="flex min-h-screen w-full bg-background">
        {!isMobile && !isFocusMode && (
          <nav data-tour="sidebar" className="transition-all duration-300 ease-out">
            <SidebarCategoryProvider>
              <AppSidebar />
            </SidebarCategoryProvider>
          </nav>
        )}

        {isMobile && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-[280px] p-0 border-r border-border">
              <SidebarCategoryProvider>
                <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
              </SidebarCategoryProvider>
            </SheetContent>
          </Sheet>
        )}

        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-out ${isFocusMode ? "ml-0" : ""}`}
        >
          {(!isFocusMode || isMobile) && (
            <header className="transition-all duration-300 ease-out">
              <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
            </header>
          )}

          <main id="main-content" className={contentClassName}>
            {isFocusMode && !isMobile && (
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground glass-card px-4 py-2 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-interactive animate-pulse" />
                <span>Modo Foco Ativo - Digitando...</span>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
      <GlobalSearch />
    </SidebarProvider>
  );
});
