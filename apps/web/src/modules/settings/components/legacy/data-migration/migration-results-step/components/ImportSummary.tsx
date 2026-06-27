import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Separator } from "@orthoplus/core-ui/separator";
import { CheckCircle2 } from "lucide-react";
import type { ImportResultsData } from "../types";

interface ImportSummaryProps {
  results: ImportResultsData;
}

export function ImportSummary({ results }: ImportSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Importação Concluída!</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resumo da Importação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SummaryItem
            label="Módulos importados:"
            value={results.imported.modules}
          />
          <SummaryItem
            label="Pacientes importados:"
            value={results.imported.patients}
          />
          <SummaryItem
            label="Prontuários importados:"
            value={results.imported.prontuarios}
          />
          <SummaryItem
            label="Agendamentos importados:"
            value={results.imported.appointments}
          />

          {(results.skipped?.length ?? 0) > 0 && (
            <>
              <Separator />
              <SummaryItem
                label="Registros ignorados:"
                value={results.skipped?.length ?? 0}
              />
            </>
          )}

          {(results.errors?.length ?? 0) > 0 && (
            <>
              <Separator />
              <SummaryItem
                label="Erros:"
                value={results.errors?.length ?? 0}
                variant="destructive"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  value: number;
  variant?: "default" | "destructive";
}

function SummaryItem({ label, value, variant = "default" }: SummaryItemProps) {
  return (
    <div className="flex justify-between">
      <span
        className={`text-sm ${variant === "destructive" ? "text-destructive" : ""}`}
      >
        {label}
      </span>
      <Badge variant={variant === "destructive" ? "destructive" : "secondary"}>
        {value}
      </Badge>
    </div>
  );
}
