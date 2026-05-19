import { memo, useMemo } from "react";
import {
  Palette,
  Diamond,
  Sun,
  Moon,
  Briefcase,
  Contrast,
} from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@orthoplus/core-ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";

const THEME_OPTIONS = [
  {
    value: "light" as const,
    label: "Light (Sage)",
    icon: Sun,
    iconClass: "text-emerald-600",
  },
  {
    value: "dark" as const,
    label: "Dark",
    icon: Moon,
    iconClass: "text-slate-400",
  },
  {
    value: "professional-dark" as const,
    label: "Professional Dark",
    icon: Briefcase,
    iconClass: "text-slate-500",
  },
  {
    value: "high-contrast" as const,
    label: "Alto Contraste",
    icon: Contrast,
    iconClass: "text-black",
  },
  {
    value: "high-contrast-dark" as const,
    label: "Alto Contraste Escuro",
    icon: Contrast,
    iconClass: "text-white",
  },
  {
    value: "premium-light" as const,
    label: "Premium Light",
    icon: Diamond,
    iconClass: "text-sky-500",
  },
  {
    value: "premium-dental-dark" as const,
    label: "Premium Dark",
    icon: Diamond,
    iconClass: "text-sky-400",
  },
];

export const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const currentIcon = useMemo(() => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5 text-emerald-600" />;
      case "dark":
        return <Moon className="h-5 w-5 text-slate-400" />;
      case "professional-dark":
        return <Briefcase className="h-5 w-5 text-slate-500" />;
      case "high-contrast":
        return <Contrast className="h-5 w-5 text-black" />;
      case "high-contrast-dark":
        return <Contrast className="h-5 w-5 text-white" />;
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
