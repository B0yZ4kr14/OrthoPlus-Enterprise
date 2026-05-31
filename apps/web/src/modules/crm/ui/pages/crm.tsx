import { useState } from "react";
import {
  Users,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  Plus,
  Target,
  Filter,
} from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import { Card } from "@orthoplus/core-ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@orthoplus/core-ui/badge";
import { Input } from "@orthoplus/core-ui/input";
import { CardTopBorder } from "@/components/shared/CardTopBorder";

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source: string;
  status: "novo" | "contatado" | "agendado" | "convertido" | "perdido";
  createdAt: string;
}

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Maria Silva",
    phone: "(11) 98765-4321",
    source: "Instagram",
    status: "novo",
    createdAt: "2026-05-10",
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao@email.com",
    source: "Google Ads",
    status: "contatado",
    createdAt: "2026-05-09",
  },
  {
    id: "3",
    name: "Ana Costa",
    phone: "(11) 91234-5678",
    source: "Indicação",
    status: "agendado",
    createdAt: "2026-05-08",
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  novo: { label: "Novo", color: "bg-info/10 text-info" },
  contatado: { label: "Contatado", color: "bg-warning/10 text-warning" },
  agendado: { label: "Agendado", color: "bg-interactive/10 text-interactive" },
  convertido: { label: "Convertido", color: "bg-success/10 text-success" },
  perdido: { label: "Perdido", color: "bg-destructive/10 text-destructive" },
};

export default function CRMPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = mockLeads.filter((l) => {
    const matchesSearch =
      !searchTerm ||
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: mockLeads.length,
    novos: mockLeads.filter((l) => l.status === "novo").length,
    convertidos: mockLeads.filter((l) => l.status === "convertido").length,
    agendados: mockLeads.filter((l) => l.status === "agendado").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="CRM"
        description="Gestão de leads, funil de vendas e relacionamento"
        actions={
          <Button className="gap-2 glow-interactive">
            <Plus className="h-4 w-4" />
            Novo Lead
          </Button>
        }
      />

      {/* Stats Premium */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={counts.total}
          icon={Users}
          variant="primary"
          description="cadastrados"
        />
        <StatsCard
          title="Novos"
          value={counts.novos}
          icon={Target}
          variant="default"
          description="aguardando contato"
        />
        <StatsCard
          title="Agendados"
          value={counts.agendados}
          icon={Calendar}
          variant="warning"
          description="consulta marcada"
        />
        <StatsCard
          title="Convertidos"
          value={counts.convertidos}
          icon={TrendingUp}
          variant="success"
          description="viraram pacientes"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {[
            "all",
            "novo",
            "contatado",
            "agendado",
            "convertido",
            "perdido",
          ].map((s) => (
            <Badge
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "Todos" : s}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tabs Premium */}
      <Tabs defaultValue="funil" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl p-1 max-w-md">
          <TabsTrigger
            value="funil"
            className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground"
          >
            <Filter className="h-4 w-4" />
            Funil
          </TabsTrigger>
          <TabsTrigger
            value="leads"
            className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground"
          >
            <Users className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger
            value="relatorios"
            className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground"
          >
            <TrendingUp className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funil" className="mt-6">
          <Card className="glass-card overflow-hidden p-6">
            <CardTopBorder color="interactive" opacity={30} />
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Filter className="h-16 w-16 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                Visualização do funil em desenvolvimento
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="mt-6">
          <Card className="glass-card overflow-hidden">
            <CardTopBorder color="interactive" opacity={30} />
            {filtered.length === 0 ? (
              <EmptyState
                icon={Users}
                message="Nenhum lead encontrado"
                description="Adicione seu primeiro lead ou ajuste os filtros."
                action={{ label: "Novo Lead", onClick: () => undefined }}
              />
            ) : (
              <div className="divide-y divide-border/50">
                {filtered.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 hover:bg-muted/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-interactive/10 shadow-sm group-hover:shadow-md group-hover:bg-interactive/20 transition-all">
                          <Users className="h-5 w-5 text-interactive" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-interactive transition-colors">
                            {lead.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </span>
                            )}
                            {lead.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </span>
                            )}
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                              {lead.source}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={statusConfig[lead.status]?.color || ""}>
                        {statusConfig[lead.status]?.label || lead.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="mt-6">
          <Card className="glass-card overflow-hidden p-6">
            <CardTopBorder color="warning" opacity={40} />
            <EmptyState
              icon={TrendingUp}
              message="Relatórios em desenvolvimento"
              description="Análises e métricas de conversão em breve."
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
