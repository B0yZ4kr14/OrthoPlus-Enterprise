import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { ReportSection } from "./ComercialReports";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface ProfissionaisReportsProps {
  onGenerateReport: (reportType: string) => void;
}

export function ProfissionaisReports({
  onGenerateReport,
}: ProfissionaisReportsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios de Profissionais</CardTitle>
        <CardDescription>
          Análises de desempenho, aniversários e permissões
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReportSection
          title="1 - Lista"
          onGenerate={() => onGenerateReport("Lista de Profissionais")}
        >
          <div>
            <Label htmlFor="report-tipo-lista">Tipo:</Label>
            <Select>
              <SelectTrigger id="report-tipo-lista">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="dentista">Dentista</SelectItem>
                <SelectItem value="recepcionista">Recepcionista</SelectItem>
                <SelectItem value="auxiliar">Auxiliar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ReportSection>

        <ReportSection
          title="2 - Aniversariantes"
          onGenerate={() => onGenerateReport("Aniversariantes")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="report-tipo-aniversario">Tipo:</Label>
              <Select>
                <SelectTrigger id="report-tipo-aniversario">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-mes">Mês:</Label>
              <Select>
                <SelectTrigger id="report-mes">
                  <SelectValue placeholder="Setembro" />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((mes) => (
                    <SelectItem key={mes} value={mes.toLowerCase()}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ReportSection>

        <ReportSection
          title="3 - Permissões dos Funcionários"
          onGenerate={() => onGenerateReport("Permissões")}
        >
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
        </ReportSection>

        <ReportSection
          title="4 - Funcionários e suas Permissões"
          onGenerate={() => onGenerateReport("Funcionários e Permissões")}
        >
          {null}
        </ReportSection>
      </CardContent>
    </Card>
  );
}
