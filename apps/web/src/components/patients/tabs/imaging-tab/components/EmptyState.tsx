import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Image as ImageIcon } from "lucide-react";

export function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">
          Nenhuma imagem ou radiografia registrada ainda.
          <br />
          Clique em "Upload de Imagem" para adicionar.
        </p>
      </CardContent>
    </Card>
  );
}
