import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Check, Diamond } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const themes = [
  {
    id: "premium-light",
    name: "Light",
    description: "Tema premium claro com acentos azul clínico",
    icon: Diamond,
    preview: {
      background: "bg-sky-50",
      card: "bg-white",
      text: "text-slate-800",
      accent: "bg-sky-500",
    },
  },
  {
    id: "premium-dental-dark",
    name: "Dark",
    description: "Tema premium escuro com tons frios azulados",
    icon: Diamond,
    preview: {
      background: "bg-slate-900",
      card: "bg-slate-800",
      text: "text-slate-100",
      accent: "bg-sky-400",
    },
  },
] as const;

export function ThemePreview() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = theme === themeOption.id;

        return (
          <Card
            key={themeOption.id}
            variant={isActive ? "elevated" : "interactive"}
            className={cn(
              "relative overflow-hidden",
              isActive && "ring-2 ring-primary ring-offset-2",
            )}
            onClick={() => setTheme(themeOption.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {themeOption.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {themeOption.description}
                    </CardDescription>
                  </div>
                </div>
                {isActive && (
                  <Badge variant="success" className="gap-1">
                    <Check className="h-3 w-3" />
                    Ativo
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Theme Preview Mockup */}
              <div
                className={cn(
                  "rounded-lg p-4 space-y-2 border border-border/50",
                  themeOption.preview.background,
                )}
              >
                <div
                  className={cn(
                    "h-3 w-3/4 rounded",
                    themeOption.preview.accent,
                  )}
                />
                <div
                  className={cn(
                    "rounded-md p-3 space-y-2",
                    themeOption.preview.card,
                  )}
                >
                  <div
                    className={cn(
                      "h-2 w-full rounded",
                      themeOption.preview.text,
                      "opacity-70",
                    )}
                  />
                  <div
                    className={cn(
                      "h-2 w-2/3 rounded",
                      themeOption.preview.text,
                      "opacity-50",
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <div
                    className={cn(
                      "h-6 w-20 rounded",
                      themeOption.preview.accent,
                    )}
                  />
                  <div
                    className={cn(
                      "h-6 w-20 rounded",
                      themeOption.preview.card,
                      "border border-current opacity-30",
                    )}
                  />
                </div>
              </div>

              <Button
                variant={isActive ? "default" : "outline"}
                className="w-full"
                onClick={() => setTheme(themeOption.id)}
              >
                {isActive ? "Tema Ativo" : "Aplicar Tema"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
