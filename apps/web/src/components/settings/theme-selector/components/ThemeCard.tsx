import { Label } from "@orthoplus/core-ui/label";
import { Card } from "@orthoplus/core-ui/card";
import { RadioGroupItem } from "@orthoplus/core-ui/radio-group";
import { Check } from "lucide-react";
import type { ThemeCardProps } from "../types";
import { ColorPreview } from "./ColorPreview";

export function ThemeCard({ themeKey, theme, isSelected }: ThemeCardProps) {
  return (
    <Label htmlFor={themeKey} className="cursor-pointer">
      <Card
        className={`
          p-4 transition-all hover:shadow-md relative
          ${isSelected ? "ring-2 ring-primary" : ""}
        `}
      >
        {isSelected && (
          <div className="absolute top-2 right-2">
            <Check className="h-5 w-5 text-primary" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-3">
          <RadioGroupItem value={themeKey} id={themeKey} />
          <span className="font-medium">{theme.name}</span>
        </div>

        <ColorPreview
          background={theme.background}
          primary={theme.primary}
          odontograma={theme.odontograma}
        />
      </Card>
    </Label>
  );
}
