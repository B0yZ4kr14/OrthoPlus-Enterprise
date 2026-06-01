import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { ReportSection, DateRangeFields } from "./ComercialReports";

interface PacientesReportsProps {
  onGenerateReport: (reportType: string) => void;
}

export function PacientesReports({ onGenerateReport }: PacientesReportsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios de Pacientes</CardTitle>
        <CardDescription>
          Análises sobre tratamentos, agendamentos e histórico de pacientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReportSection
          title="1 - Pacientes com Tratamento em Andamento/Futuro"
          onGenerate={() => onGenerateReport("Tratamento em Andamento")}
        >
          {null}
        </ReportSection>

        <ReportSection
          title="2 - Pacientes que Estarão Sem Agendamento"
          onGenerate={() => onGenerateReport("Sem Agendamento")}
        >
          <div>
            <Label htmlFor="report-pacientes-date">Data:</Label>
            <Input id="report-pacientes-date" type="date" />
          </div>
        </ReportSection>

        <ReportSection
          title="6 - Relatório de Orçamentos Clínicos"
          onGenerate={() => onGenerateReport("Orçamentos Clínicos")}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DateRangeFields />
            <div>
              <Label htmlFor="report-funcionario">Funcionário:</Label>
              <Select>
                <SelectTrigger id="report-funcionario">
                  <SelectValue placeholder="-- Todos --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ReportSection>

        <ReportSection
          title="7 - Relatório Tempo Médio de Tratamento Por Dentista"
          onGenerate={() => onGenerateReport("Tempo Médio por Dentista")}
        >
          {null}
        </ReportSection>
      </CardContent>
    </Card>
  );
}
