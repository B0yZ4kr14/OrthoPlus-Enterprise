import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { BarChart3, Users, UserCheck, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { ComercialReports } from "../components/ComercialReports";
import { PacientesReports } from "../components/PacientesReports";
import { ProfissionaisReports } from "../components/ProfissionaisReports";
import { FinanceiroReports } from "../components/FinanceiroReports";

export default function Relatorios() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleGenerateReport = (reportType: string) => {
    toast.success(`Relatório "${reportType}" gerado com sucesso!`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Gere relatórios detalhados para análise de dados da clínica
        </p>
      </div>

      <Tabs defaultValue="comercial" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comercial" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Comercial
          </TabsTrigger>
          <TabsTrigger value="pacientes" className="gap-2">
            <Users className="h-4 w-4" />
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="profissionais" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Profissionais
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comercial">
          <ComercialReports
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onGenerateReport={handleGenerateReport}
          />
        </TabsContent>

        <TabsContent value="pacientes">
          <PacientesReports onGenerateReport={handleGenerateReport} />
        </TabsContent>

        <TabsContent value="profissionais">
          <ProfissionaisReports onGenerateReport={handleGenerateReport} />
        </TabsContent>

        <TabsContent value="financeiro">
          <FinanceiroReports onGenerateReport={handleGenerateReport} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
