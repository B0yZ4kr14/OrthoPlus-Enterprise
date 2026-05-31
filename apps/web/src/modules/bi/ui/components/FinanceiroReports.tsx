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
import { ReportSection } from "./ComercialReports";

interface FinanceiroReportsProps {
  onGenerateReport: (reportType: string) => void;
}

export function FinanceiroReports({
  onGenerateReport,
}: FinanceiroReportsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios Financeiros - Contas a Receber</CardTitle>
        <CardDescription>
          Análises de faturamento, recebimentos e inadimplência
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReportSection
          title="1 - Contas Recebidas/Adiantamentos Bruto"
          onGenerate={() => onGenerateReport("Contas Recebidas")}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="report-tipo">Tipo:</Label>
              <Select>
                <SelectTrigger id="report-tipo">
                  <SelectValue placeholder="-- Todos --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-mes-inicio">Mês:</Label>
              <Input id="report-mes-inicio" type="month" />
            </div>
            <div>
              <Label htmlFor="report-mes-fim">Fim:</Label>
              <Input id="report-mes-fim" type="month" />
            </div>
          </div>
        </ReportSection>

        <ReportSection
          title="2 - Inadimplência"
          onGenerate={() => onGenerateReport("Inadimplência")}
        >
          {null}
        </ReportSection>

        <ReportSection
          title="3 - Lançamentos Financeiros"
          onGenerate={() => onGenerateReport("Lançamentos Financeiros")}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="report-lanc-mes">Mês:</Label>
              <Input id="report-lanc-mes" type="month" />
            </div>
            <div>
              <Label htmlFor="report-lanc-fim">Fim:</Label>
              <Input id="report-lanc-fim" type="month" />
            </div>
            <div>
              <Label htmlFor="report-conta">Conta:</Label>
              <Select>
                <SelectTrigger id="report-conta">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ReportSection>

        <ReportSection
          title="8 - Visão de Pagamentos de Serviços"
          onGenerate={() => onGenerateReport("Pagamentos de Serviços")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Mês/Inicial:</Label>
              <Input type="month" />
            </div>
            <div>
              <Label>Ano:</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="2025" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ReportSection>
      </CardContent>
    </Card>
  );
}
