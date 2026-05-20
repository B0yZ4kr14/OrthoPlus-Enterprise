import { memo, useMemo } from "react";
import { Diamond, Sun, Moon } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@orthoplus/core-ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";

const THEME_OPTIONS = [
  {
    value: "premium-light" as const,
    label: "Clínica Cristal",
    icon: Sun,
    iconClass: "text-sky-500",
  },
  {
    value: "premium-dental-dark" as const,
    label: "Noite Clínica",
    icon: Moon,
    iconClass: "text-sky-400",
  },
];

export const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const currentIcon = useMemo(() => {
    switch (theme) {
      case "premium-light":
        return <Sun className="h-5 w-5 text-sky-500" />;
      case "premium-dental-dark":
        return <Moon className="h-5 w-5 text-sky-400" />;
      default:
        return <Diamond className="h-5 w-5" />;
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
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant={theme === option.value ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setTheme(option.value)}
            >
              <Icon className={`h-4 w-4 ${option.iconClass}`} />
              {option.label}
            </Button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
