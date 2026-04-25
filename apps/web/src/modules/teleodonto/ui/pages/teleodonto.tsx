import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Video, Calendar, FileText, Users } from "lucide-react";
import { TeleodontoSessionList } from "@/modules/teleodonto/presentation/components/TeleodontoSessionList";
import { TeleodontoScheduler } from "@/modules/teleodonto/presentation/components/TeleodontoScheduler";
import { TeleodontoDashboard } from "@/modules/teleodonto/presentation/components/TeleodontoDashboard";
import { useTeleconsultas } from "@/modules/teleodonto/application/hooks/useTeleconsultas";
import { PageHeader } from "@/components/shared/PageHeader";

export default function TeleodontoPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { teleconsultas, isLoading } = useTeleconsultas();

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={Video} 
        title="Teleodonto" 
        description="Consultas e atendimentos remotos" 
        actions={
          <Button>
            <Video className="mr-2 h-4 w-4" />
            Nova Sessão
          </Button>
        } 
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <Users className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Video className="mr-2 h-4 w-4" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="mr-2 h-4 w-4" />
            Agenda
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <TeleodontoDashboard />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <TeleodontoSessionList />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <TeleodontoScheduler />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Teleodontologia</CardTitle>
              <CardDescription>
                Análise de sessões e performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
