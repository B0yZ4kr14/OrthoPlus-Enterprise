// cspell:disable
import { Activity, Heart, Droplet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import type { Patient } from "./types";
import { getBPStatus } from "./utils";

interface SinaisVitaisCardProps {
  patient: Patient;
}

export function SinaisVitaisCard({ patient }: SinaisVitaisCardProps) {
  const bpStatus = getBPStatus(patient.blood_pressure_systolic, patient.blood_pressure_diastolic);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Sinais Vitais
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Pressão Arterial
          </label>
          {patient.blood_pressure_systolic && patient.blood_pressure_diastolic ? (
            <div className="mt-2">
              <p className="text-3xl font-bold font-mono">
                {patient.blood_pressure_systolic}/{patient.blood_pressure_diastolic}
              </p>
              <p className="text-sm text-muted-foreground">mmHg</p>
              {bpStatus && (
                <Badge className={`mt-2 ${bpStatus.color}`} variant="outline">
                  {bpStatus.label}
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">Não medido</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Frequência Cardíaca
          </label>
          {patient.heart_rate ? (
            <div className="mt-2">
              <p className="text-3xl font-bold font-mono">{patient.heart_rate}</p>
              <p className="text-sm text-muted-foreground">bpm</p>
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">Não medido</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Droplet className="h-4 w-4" />
            Tipo Sanguíneo
          </label>
          {patient.blood_type ? (
            <div className="mt-2">
              <p className="text-3xl font-bold font-mono">{patient.blood_type}</p>
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">Não informado</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
