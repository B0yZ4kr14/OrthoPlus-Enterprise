import {
  FileCode,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import { Input } from "@orthoplus/core-ui/input";
import { Textarea } from "@orthoplus/core-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useADRs } from "@/hooks/api/useADRs";

export default function ADRsPage() {
  const { clinicId, user } = useAuth();
  const {
    adrs,
    isLoading,
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    handleCreate,
    isCreating,
  } = useADRs(clinicId ?? undefined, user?.id ?? undefined);

  const getStatusBadge = (status: typeof formData.status) => {
    const variants = {
      proposed: {
        variant: "secondary" as const,
        icon: Clock,
        label: "Proposto",
      },
      accepted: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Aceito",
      },
      deprecated: {
        variant: "outline" as const,
        icon: XCircle,
        label: "Deprecated",
      },
      superseded: {
        variant: "outline" as const,
        icon: AlertCircle,
        label: "Superseded",
      },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Architecture Decision Records (ADRs)"
          description="Documentação de decisões arquiteturais importantes"
          icon={FileCode}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo ADR
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Architecture Decision Record</DialogTitle>
              <DialogDescription>
                Documente uma decisão arquitetural importante
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  id="adr-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Migração de Monolito para Microserviços"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) =>
                    setFormData({
                      ...formData,
                      status: value as typeof formData.status,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposed">Proposto</SelectItem>
                    <SelectItem value="accepted">Aceito</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                    <SelectItem value="superseded">Superseded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Contexto</label>
                <Textarea
                  value={formData.context}
                  onChange={(e) =>
                    setFormData({ ...formData, context: e.target.value })
                  }
                  placeholder="Qual é o contexto e o problema que estamos tentando resolver?"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Decisão</label>
                <Textarea
                  value={formData.decision}
                  onChange={(e) =>
                    setFormData({ ...formData, decision: e.target.value })
                  }
                  placeholder="Qual decisão foi tomada?"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Consequências</label>
                <Textarea
                  value={formData.consequences}
                  onChange={(e) =>
                    setFormData({ ...formData, consequences: e.target.value })
                  }
                  placeholder="Quais são as consequências dessa decisão?"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Alternativas Consideradas (opcional)
                </label>
                <Textarea
                  value={formData.alternatives_considered}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alternatives_considered: e.target.value,
                    })
                  }
                  placeholder="Que outras opções foram consideradas?"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleCreate} disabled={isCreating}>
                  Criar ADR
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Carregando ADRs...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {adrs.map((adr) => (
              <Card key={adr.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          ADR-{adr.adr_number.toString().padStart(3, "0")}
                        </Badge>
                        {getStatusBadge(adr.status)}
                      </div>
                      <CardTitle className="text-xl">{adr.title}</CardTitle>
                      <CardDescription>
                        Criado em{" "}
                        {new Date(adr.created_at).toLocaleDateString()}
                        {adr.decided_at &&
                          ` • Decidido em ${new Date(adr.decided_at).toLocaleDateString()}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Contexto</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {adr.context}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Decisão</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {adr.decision}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Consequências</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {adr.consequences}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {adrs.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium">Nenhum ADR criado</p>
                  <p className="text-sm text-muted-foreground">
                    Comece documentando suas decisões arquiteturais
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
