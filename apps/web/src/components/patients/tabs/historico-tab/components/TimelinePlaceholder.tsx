import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { History } from "lucide-react";

interface TimelinePlaceholderProps {
  title?: string;
  description?: string;
}

export function TimelinePlaceholder({
  title = "Timeline de Eventos",
  description = "Timeline de eventos em desenvolvimento. Aqui será exibida uma timeline completa com todas as consultas, procedimentos, pagamentos e eventos relacionados ao paciente.",
}: TimelinePlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
