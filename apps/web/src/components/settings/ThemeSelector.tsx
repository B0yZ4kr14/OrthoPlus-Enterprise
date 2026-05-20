import { Card } from "@orthoplus/core-ui/card";
import { Label } from "@orthoplus/core-ui/label";
import { RadioGroup, RadioGroupItem } from "@orthoplus/core-ui/radio-group";
import { Check, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const themes = [
  {
    key: "premium-light" as const,
    name: "Clínica Cristal (Claro)",
    description: "Tema claro premium com acentos sky/cyan",
    icon: Sun,
    preview: {
      bg: "bg-sky-50",
      primary: "bg-sky-500",
      accent: "bg-info",
    },
  },
  {
    key: "premium-dental-dark" as const,
    name: "Noite Clínica (Escuro)",
    description: "Tema escuro premium com acentos sky/cyan",
    icon: Moon,
    preview: {
      bg: "bg-slate-900",
      primary: "bg-sky-400",
      accent: "bg-info",
    },
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Tema Visual</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Escolha o tema visual que melhor se adapta ao ambiente da sua clínica
      </p>

      <RadioGroup
        value={theme}
        onValueChange={(value) => setTheme(value as "premium-light" | "premium-dental-dark")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map(({ key, name, description, icon: Icon, preview }) => (
            <Label key={key} htmlFor={key} className="cursor-pointer">
              <Card
                className={`
                  p-4 transition-all hover:shadow-md relative
                  ${theme === key ? "ring-2 ring-primary" : ""}
                `}
              >
                {theme === key && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <RadioGroupItem value={key} id={key} />
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="font-medium block">{name}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </div>
                </div>

                {/* Preview de cores */}
                <div className="flex gap-2 mt-3">
                  <div
                    className={`w-8 h-8 rounded border ${preview.bg}`}
                    title="Background"
                  />
                  <div
                    className={`w-8 h-8 rounded border ${preview.primary}`}
                    title="Primary"
                  />
                  <div
                    className={`w-8 h-8 rounded border ${preview.accent}`}
                    title="Accent"
                  />
                </div>
              </Card>
            </Label>
          ))}
        </div>
      </RadioGroup>
    </Card>
  );
}
