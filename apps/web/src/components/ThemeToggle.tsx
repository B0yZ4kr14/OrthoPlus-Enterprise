import { memo, useMemo } from "react";
import { Moon, Sun, Palette } from "lucide-react";
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
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {currentIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-popover z-50 backdrop-blur-sm"
      >
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setTheme("light")}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setTheme("dark")}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
