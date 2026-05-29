// cspell:disable
import { Scale, Ruler } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { Patient } from "./types";
import { getBMICategory } from "./utils";

interface MedidasCardProps {
  patient: Patient;
}

export function MedidasCard({ patient }: MedidasCardProps) {
  const bmiCategory = getBMICategory(patient.bmi);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Medidas Antropométricas
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Peso
          </label>
          {patient.weight_kg ? (
            <div className="mt-2">
              <p className="text-3xl font-bold">{patient.weight_kg}</p>
              <p className="text-sm text-muted-foreground">kg</p>
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">Não medido</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Altura
          </label>
          {patient.height_cm ? (
            <div className="mt-2">
              <p className="text-3xl font-bold">{patient.height_cm}</p>
              <p className="text-sm text-muted-foreground">cm</p>
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">Não medido</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            IMC
          </label>
          {patient.bmi ? (
            <div className="mt-2">
              <p className="text-3xl font-bold">{patient.bmi.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">kg/m²</p>
              {bmiCategory && (
                <Badge
                  className={`mt-2 ${bmiCategory.color}`}
                  variant="outline"
                >
                  {bmiCategory.label}
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">Não calculado</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
