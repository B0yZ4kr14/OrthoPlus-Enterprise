import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Download } from "lucide-react";

interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
  onGenerate: () => void;
}

export function ReportSection({
  title,
  children,
  onGenerate,
}: ReportSectionProps) {
  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold">{title}</h3>
      {children}
      <Button className="w-full" onClick={onGenerate}>
        <Download className="mr-2 h-4 w-4" />
        Gerar Relatório
      </Button>
    </div>
  );
}

interface DateRangeFieldsProps {
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
}

export function DateRangeFields({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="report-date-from">De:</Label>
        <Input
          id="report-date-from"
          type="date"
          value={dateFrom}
          onChange={
            onDateFromChange
              ? (e) => onDateFromChange(e.target.value)
              : undefined
          }
        />
      </div>
      <div>
        <Label htmlFor="report-date-to">Até:</Label>
        <Input
          id="report-date-to"
          type="date"
          value={dateTo}
          onChange={
            onDateToChange ? (e) => onDateToChange(e.target.value) : undefined
          }
        />
      </div>
    </>
  );
}

interface ComercialReportsProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onGenerateReport: (reportType: string) => void;
}

export function ComercialReports({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onGenerateReport,
}: ComercialReportsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios Comerciais</CardTitle>
        <CardDescription>
          Análises de contratos, campanhas e desempenho comercial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReportSection
          title="1 - Relatório Analítico de Contratos"
          onGenerate={() => onGenerateReport("Analítico de Contratos")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DateRangeFields
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={onDateFromChange}
              onDateToChange={onDateToChange}
            />
            <div>
              <Label htmlFor="report-status">Status:</Label>
              <Select>
                <SelectTrigger id="report-status">
                  <SelectValue placeholder="-- Todos --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-plano">Plano:</Label>
              <Select>
                <SelectTrigger id="report-plano">
                  <SelectValue placeholder="-- Todos --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ReportSection>

        <ReportSection
          title="2 - Relatório Sintético por Campanha"
          onGenerate={() => onGenerateReport("Sintético por Campanha")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="report-mes">Mês:</Label>
              <Select>
                <SelectTrigger id="report-mes">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {[
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
                  ].map((mes) => (
                    <SelectItem key={mes} value={mes.toLowerCase()}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-ano">Ano:</Label>
              <Select>
                <SelectTrigger id="report-ano">
                  <SelectValue placeholder="2025" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ReportSection>

        <ReportSection
          title="3 - Relatório Sintético por Funcionário"
          onGenerate={() => onGenerateReport("Sintético por Funcionário")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateRangeFields />
          </div>
        </ReportSection>

        <ReportSection
          title="4 - Relatório Comercial de Contratos Não Fechados"
          onGenerate={() => onGenerateReport("Contratos Não Fechados")}
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
      </CardContent>
    </Card>
  );
}
