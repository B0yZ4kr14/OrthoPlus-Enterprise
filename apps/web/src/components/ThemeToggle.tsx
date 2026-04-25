import { memo, useMemo } from "react";
import { Moon, Sun, Palette, Sparkles } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@orthoplus/core-ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const currentIcon = useMemo(() => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5" />;
      case "dark":
        return <Moon className="h-5 w-5" />;
      default:
        return <Palette className="h-5 w-5" />;
    }
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 hover:bg-accent transition-colors"
        >
          {currentIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-popover z-50 border"
      >
        <div className="px-2 py-1.5 text-sm font-medium text-foreground">
          Tema
        </div>
        <Button
          variant={theme === "light" ? "secondary" : "ghost"}
          className="w-full justify-start gap-2"
          onClick={() => setTheme("light")}
        >
          <Sun className="h-4 w-4" />
          Light
        </Button>
        <Button
          variant={theme === "dark" ? "secondary" : "ghost"}
          className="w-full justify-start gap-2"
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-4 w-4" />
          Dark
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
