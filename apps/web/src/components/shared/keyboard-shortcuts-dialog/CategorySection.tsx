import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { KeyboardShortcut } from "./types";

interface CategorySectionProps {
  category: string;
  shortcuts: KeyboardShortcut[];
}

export function CategorySection({ category, shortcuts }: CategorySectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">
        {category}
      </h3>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <span className="text-sm">{shortcut.description}</span>
                <Badge variant="outline" className="font-mono">
                  {shortcut.key}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
