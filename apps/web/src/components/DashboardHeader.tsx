import { LogOut, Building2, User, Pin, PinOff, PanelLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@orthoplus/core-ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@orthoplus/core-ui/button";
import { GlobalSearch } from "@/components/GlobalSearch";
import { HotkeysHelp } from "@/components/HotkeysHelp";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { QuickActions } from "@/components/layout/QuickActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@orthoplus/core-ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";
import { useSidebarHover } from "@/hooks/useSidebarHover";

function SidebarPinToggle() {
  const { isAutoHide, toggleAutoHide } = useSidebarHover()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleAutoHide}
      className="h-9 w-9 hidden md:flex"
      title={isAutoHide ? "Fixar sidebar (Ctrl+B)" : "Modo hover"}
      data-testid="sidebar-pin-toggle"
    >
      {isAutoHide ? (
        <PanelLeft className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Pin className="h-4 w-4 text-interactive" />
      )}
    </Button>
  )
}

interface DashboardHeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({
  className,
  onMenuClick,
}: DashboardHeaderProps = {}) {
  const {
    user,
    signOut,
    userRole,
    availableClinics,
    selectedClinic,
    switchClinic,
  } = useAuth();
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };
  const getRoleName = (role: "ADMIN" | "MEMBER" | null) => {
    if (role === "ADMIN") return "Administrador";
    if (role === "MEMBER") return "Usuário";
    return "Carregando...";
  };
  return (
    <>
      <HotkeysHelp />
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-card/80 backdrop-blur-xl border-b border-border/50",
          className,
        )}
      >
        <div className="flex items-center justify-between h-[60px] px-6 gap-6">
          {/* Mobile menu button - shown only on mobile */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden min-h-[44px] min-w-[44px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          )}

          {/* Search - left aligned with max-width */}
          <div
            className="flex-1 max-w-md hidden md:block"
            data-tour="search-bar"
          >
            <GlobalSearch />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <NotificationDropdown />

            <QuickActions />

            <div data-tour="theme-toggle">
              <ThemeToggle />
            </div>

            <SidebarPinToggle />

            {availableClinics && availableClinics.length > 1 && (
              <Select value={selectedClinic?.id} onValueChange={switchClinic}>
                <SelectTrigger className="w-[180px] h-9">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Clínica" />
                </SelectTrigger>
                <SelectContent>
                  {availableClinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-9 px-2"
                  data-tour="user-menu"
                >
                  <Avatar className="h-7 w-7 border-2 border-border shadow-[0_0_8px_hsl(var(--interactive)/0.2)]">
                    {(() => {
                      if (!user || !("user_metadata" in user)) return null;
                      const meta = user.user_metadata as Record<string, unknown> | undefined;
                      const avatarUrl = typeof meta?.avatar_url === "string" ? meta.avatar_url : null;
                      if (!avatarUrl) return null;
                      return (
                        <AvatarImage
                          src={avatarUrl}
                          alt={String(meta?.full_name || user.email || "Avatar")}
                        />
                      );
                    })()}
                    <AvatarFallback className="bg-interactive text-interactive-foreground text-xs font-semibold">
                      {user?.email ? getInitials(user.email) : "US"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-medium">
                      {user?.email?.split("@")[0] || "Usuário"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {getRoleName(userRole)}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {getRoleName(userRole)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/settings/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="px-6 py-1.5 border-t border-border/30 bg-muted/20">
          <Breadcrumbs />
        </div>
      </header>
    </>
  );
}
