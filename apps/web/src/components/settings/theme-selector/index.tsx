import { Card } from "@orthoplus/core-ui/card";
import { RadioGroup } from "@orthoplus/core-ui/radio-group";
import {
  clinicalThemes,
} from "@/themes/clinical";
import { useThemeSelector } from "./hooks/useThemeSelector";
import { ThemeCard } from "./components/ThemeCard";

export * from "./types";
export { ColorPreview } from "./components/ColorPreview";
export { ThemeCard } from "./components/ThemeCard";
export { useThemeSelector } from "./hooks/useThemeSelector";

export function ThemeSelector() {
  const { selectedTheme, handleThemeChange } = useThemeSelector();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Tema Clínico</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Escolha o tema visual que melhor se adapta ao ambiente da sua clínica
      </p>

      <RadioGroup
        value={selectedTheme}
        onValueChange={handleThemeChange as (value: string) => void}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(clinicalThemes).map(([key, theme]) => (
            <ThemeCard
              key={key}
              themeKey={key}
              theme={theme}
              isSelected={selectedTheme === key}
            />
          ))}
        </div>
      </RadioGroup>
    </Card>
  );
}
