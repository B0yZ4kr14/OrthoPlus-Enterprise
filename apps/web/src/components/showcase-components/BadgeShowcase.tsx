import { Badge } from "@orthoplus/core-ui/badge";
import { Separator } from "@orthoplus/core-ui/separator";

export function BadgeShowcase() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">
          Variantes Padrão
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">
          Variantes Coloridas (com Shimmer)
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </div>
    </div>
  );
}
