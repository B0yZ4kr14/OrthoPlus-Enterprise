import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { Button } from "@orthoplus/core-ui/button";
import {
  FileText,
  Send,
  CheckCircle,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { TISSBatchList } from "@/modules/tiss/presentation/components/TISSBatchList";
import { TISSGuideForm } from "@/modules/tiss/presentation/components/TISSGuideForm";
import { TISSDashboard } from "@/modules/tiss/presentation/components/TISSDashboard";
import { TISSGlosasManager } from "@/modules/tiss/presentation/components/TISSGlosasManager";
import { useTISSGuides } from "@/modules/tiss/application/hooks/useTISSGuides";
import { TISSConveniosManager } from "@/modules/tiss/presentation/components/TISSConveniosManager";
import { PageHeader } from "@/components/shared/PageHeader";
import { FileSpreadsheet } from "lucide-react";

export default function TISSPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  useTISSGuides();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileSpreadsheet}
        title="TISS"
        description="Troca de Informações em Saúde Suplementar"
        actions={
          <Button type="button" onClick={() => setActiveTab("guides")}>
            <FileText className="mr-2 h-4 w-4" />
            Nova Guia
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">
            <CheckCircle className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="guides">
            <FileText className="mr-2 h-4 w-4" />
            Guias
          </TabsTrigger>
          <TabsTrigger value="batches">
            <Send className="mr-2 h-4 w-4" />
            Lotes
          </TabsTrigger>
          <TabsTrigger value="glosas">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Glosas
          </TabsTrigger>
          <TabsTrigger value="convenios">
            <Building2 className="mr-2 h-4 w-4" />
            Convênios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <TISSDashboard />
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <TISSGuideForm />
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <TISSBatchList />
        </TabsContent>

        <TabsContent value="glosas" className="space-y-4">
          <TISSGlosasManager />
        </TabsContent>

        <TabsContent value="convenios" className="space-y-4">
          <TISSConveniosManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
