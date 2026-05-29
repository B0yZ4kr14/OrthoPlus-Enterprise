// cspell:disable
import { Smile } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { Patient } from "./types";

interface AvaliacaoBucalCardProps {
  patient: Patient;
}

function getHygieneVariant(
  quality?: string,
): "default" | "secondary" | "outline" | "destructive" {
  if (quality === "excelente") return "default";
  if (quality === "boa") return "secondary";
  if (quality === "regular") return "outline";
  return "destructive";
}

function getGumVariant(
  condition?: string,
): "default" | "outline" | "destructive" {
  if (condition === "saudavel") return "default";
  if (condition === "gengivite") return "outline";
  return "destructive";
}

export function AvaliacaoBucalCard({ patient }: AvaliacaoBucalCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="h-5 w-5" />
          Avaliação Bucal
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Qualidade da Higiene Oral
          </label>
          {patient.oral_hygiene_quality ? (
            <div className="mt-2">
              <Badge
                variant={getHygieneVariant(patient.oral_hygiene_quality)}
                className="text-base py-1.5"
              >
                {patient.oral_hygiene_quality}
              </Badge>
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">Não avaliado</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Condição Gengival
          </label>
          {patient.gum_condition ? (
            <div className="mt-2">
              <Badge
                variant={getGumVariant(patient.gum_condition)}
                className="text-base py-1.5"
              >
                {patient.gum_condition}
              </Badge>
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">Não avaliado</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
