import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";

interface RegistrationInfoProps {
  createdAt: string;
  updatedAt: string;
  status: string;
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("pt-BR");
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "ativo":
      return "default";
    case "inativo":
      return "secondary";
    default:
      return "outline";
  }
}

export function RegistrationInfo({
  createdAt,
  updatedAt,
  status,
}: RegistrationInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações de Cadastro</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Data de Cadastro
          </label>
          <p className="text-lg mt-2">{formatDateTime(createdAt)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Última Atualização
          </label>
          <p className="text-lg mt-2">{formatDateTime(updatedAt)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Status
          </label>
          <div className="mt-2">
            <Badge
              variant={getStatusVariant(status)}
              className="text-base py-1.5"
            >
              {status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
