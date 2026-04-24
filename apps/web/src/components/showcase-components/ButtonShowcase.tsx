import { Button } from "@orthoplus/core-ui/button";
import { Separator } from "@orthoplus/core-ui/separator";

export function ButtonShowcase() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Tamanhos</h4>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">i</Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Variantes Padrão</h4>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Variantes Elevated (com Glow)</h4>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="elevated">Elevated Primary</Button>
          <Button variant="elevated-secondary">Elevated Secondary</Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Variantes Coloridas (com Gradiente)</h4>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="info">Info</Button>
        </div>
      </div>
    </div>
  );
}
