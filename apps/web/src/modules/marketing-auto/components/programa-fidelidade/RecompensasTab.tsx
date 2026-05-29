// cspell:disable
import { Gift, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import type { Recompensa } from "./types";

interface RecompensasTabProps {
  recompensas: Recompensa[];
  onAdd: () => void;
  onEdit: (recompensa: Recompensa) => void;
}

export function RecompensasTab({
  recompensas,
  onAdd,
  onEdit,
}: RecompensasTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Catálogo de Recompensas</CardTitle>
        <Button onClick={onAdd}>Adicionar Recompensa</Button>
      </CardHeader>
      <CardContent>
        {recompensas.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma recompensa cadastrada ainda
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recompensas.map((recompensa) => (
              <Card key={recompensa.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <Gift className="h-8 w-8 text-primary" />
                  <Badge variant={recompensa.ativo ? "default" : "secondary"}>
                    {recompensa.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {recompensa.nome}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {recompensa.descricao}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-warning fill-yellow-500" />
                    <span className="font-bold">
                      {recompensa.pontos_necessarios}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(recompensa)}
                  >
                    Editar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
