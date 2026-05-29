// cspell:disable
import { Zap, Share2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Progress } from "@orthoplus/core-ui/progress";
import type { PacientePontos } from "./types";
import { getNivelColor } from "./utils";

interface PacientesTabProps {
  pacientes: PacientePontos[];
  onShareBadge: (name: string) => void;
  onTriggerConfetti: () => void;
}

export function PacientesTab({
  pacientes,
  onShareBadge,
  onTriggerConfetti,
}: PacientesTabProps) {
  if (pacientes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhum paciente cadastrado no programa ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Pacientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pacientes.map((paciente, index) => (
            <Card
              key={paciente.id}
              className="p-4 transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {paciente.patient_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getNivelColor(paciente.nivel)}
                      >
                        {paciente.nivel}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {paciente.pontos_totais} pontos totais
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {paciente.pontos_disponiveis}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    pontos disponíveis
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso para próximo nível</span>
                  <span className="font-medium">
                    {Math.round((paciente.pontos_totais % 1000) / 10)}%
                  </span>
                </div>
                <Progress
                  value={(paciente.pontos_totais % 1000) / 10}
                  className="h-3 transition-all duration-500"
                />
              </div>

              {paciente.badges && paciente.badges.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {paciente.badges.map((badge, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => {
                        onTriggerConfetti();
                        onShareBadge(badge.nome);
                      }}
                    >
                      <Zap className="h-3 w-3" />
                      {badge.nome}
                      <Share2 className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
