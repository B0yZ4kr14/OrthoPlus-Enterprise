import { Badge } from "@orthoplus/core-ui/badge";

export function DialogFooter() {
  return (
    <div className="flex items-center justify-center pt-4 text-sm text-muted-foreground">
      <p>
        Pressione{" "}
        <Badge variant="outline" className="mx-1">
          Shift + ?
        </Badge>{" "}
        a qualquer momento para ver este menu
      </p>
    </div>
  );
}
