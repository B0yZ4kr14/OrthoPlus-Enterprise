// cspell:disable
import { MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Progress } from "@orthoplus/core-ui/progress";
import type { Patient } from "./types";

interface QueixaPrincipalCardProps {
  patient: Patient;
}

export function QueixaPrincipalCard({ patient }: QueixaPrincipalCardProps) {
  if (!patient.main_complaint) return null;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Queixa Principal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg italic">"{patient.main_complaint}"</p>
        {patient.pain_level !== null && patient.pain_level !== undefined && (
          <div className="mt-4">
            <label className="text-sm font-medium text-muted-foreground">
              Nível de Dor (0-10)
            </label>
            <div className="flex items-center gap-4 mt-2">
              <Progress value={patient.pain_level * 10} className="flex-1" />
              <span className="text-2xl font-bold">{patient.pain_level}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
