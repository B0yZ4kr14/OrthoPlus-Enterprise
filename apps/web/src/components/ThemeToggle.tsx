import { memo, useMemo } from "react";
import { Palette, Sparkles, Diamond } from "lucide-react";
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
      case "premium-light":
        return <Diamond className="h-5 w-5 text-sky-500" />;
      case "premium-dental-dark":
        return <Diamond className="h-5 w-5 text-sky-400" />;
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
          variant={theme === "premium-light" ? "secondary" : "ghost"}
          className="w-full justify-start gap-2"
          onClick={() => setTheme("premium-light")}
        >
          <Diamond className="h-4 w-4 text-sky-500" />
          Light
        </Button>
        <Button
          variant={theme === "premium-dental-dark" ? "secondary" : "ghost"}
          className="w-full justify-start gap-2"
          onClick={() => setTheme("premium-dental-dark")}
        >
          <Diamond className="h-4 w-4 text-sky-400" />
          Dark
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
