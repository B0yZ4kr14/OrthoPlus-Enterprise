import { useState } from "react";
import { useCampaigns } from "../../presentation/hooks/useCampaigns";
import { CampaignList, CampaignForm } from "../components";
import { Button } from "@orthoplus/core-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { Plus, TrendingUp, Users, Mail, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";

export function MarketingAutoPage() {
  const {
    campaigns,
    loading,
    createCampaign,
    activateCampaign,
    pauseCampaign,
    completeCampaign,
    totalCampaigns,
    activeCampaigns,
    draftCampaigns,
    completedCampaigns,
  } = useCampaigns();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateCampaign = async (data: unknown) => {
    try {
      await createCampaign(data);
      setShowCreateDialog(false);
      toast.success("Campanha criada com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar campanha");
    }
  };

  const handleActivate = async (campaignId: string) => {
    try {
      await activateCampaign(campaignId);
      toast.success("Campanha ativada!");
    } catch (error) {
      toast.error("Erro ao ativar campanha");
    }
  };

  const handlePause = async (campaignId: string) => {
    try {
      await pauseCampaign(campaignId);
      toast.success("Campanha pausada!");
    } catch (error) {
      toast.error("Erro ao pausar campanha");
    }
  };

  const handleComplete = async (campaignId: string) => {
    try {
      await completeCampaign(campaignId);
      toast.success("Campanha concluída!");
    } catch (error) {
      toast.error("Erro ao concluir campanha");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Automação de Marketing
          </h1>
          <p className="text-muted-foreground">
            Crie e gerencie campanhas automatizadas para seus pacientes
          </p>
        </div>

        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Métricas Gerais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Campanhas
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaigns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campanhas Ativas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {activeCampaigns}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCampaigns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCampaigns}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Campanhas com Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="active">Ativas</TabsTrigger>
          <TabsTrigger value="draft">Rascunhos</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <CampaignList
            campaigns={campaigns}
            loading={loading}
            onActivate={handleActivate}
            onPause={handlePause}
            onComplete={handleComplete}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <CampaignList
            campaigns={campaigns.filter((c) => c.isActive())}
            loading={loading}
            onActivate={handleActivate}
            onPause={handlePause}
            onComplete={handleComplete}
          />
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <CampaignList
            campaigns={campaigns.filter((c) => c.isDraft())}
            loading={loading}
            onActivate={handleActivate}
            onPause={handlePause}
            onComplete={handleComplete}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <CampaignList
            campaigns={campaigns.filter((c) => c.isCompleted())}
            loading={loading}
            onActivate={handleActivate}
            onPause={handlePause}
            onComplete={handleComplete}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog para criar campanha */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Campanha</DialogTitle>
          </DialogHeader>
          <CampaignForm
            onSubmit={handleCreateCampaign}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
