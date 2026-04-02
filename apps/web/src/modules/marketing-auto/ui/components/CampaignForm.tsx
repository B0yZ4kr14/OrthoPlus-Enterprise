import { useState } from "react";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { CampaignType } from "../../domain/entities/Campaign";
import { MessageTemplate } from "../../domain/valueObjects/MessageTemplate";
import { Loader2 } from "lucide-react";

interface CampaignFormProps {
  onSubmit: (data: {
    name: string;
    description?: string;
    type: CampaignType;
    messageTemplate: string;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function CampaignForm({ onSubmit, onCancel }: CampaignFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CampaignType>("RECALL");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPredefinedTemplate = (templateType: CampaignType) => {
    let template: MessageTemplate;

    switch (templateType) {
      case "RECALL":
        template = MessageTemplate.createRecallTemplate();
        break;
      case "POS_CONSULTA":
        template = MessageTemplate.createPosConsultaTemplate();
        break;
      case "ANIVERSARIO":
        template = MessageTemplate.createAniversarioTemplate();
        break;
      default:
        template = new MessageTemplate("");
    }

    setMessageTemplate(template.getTemplate());
  };

  const handleTypeChange = (newType: CampaignType) => {
    setType(newType);
    if (!messageTemplate) {
      loadPredefinedTemplate(newType);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      // Validar template
      try {
        new MessageTemplate(messageTemplate);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Template inválido");
        return;
      }

      await onSubmit({
        name,
        description: description || undefined,
        type,
        messageTemplate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar campanha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Nova Campanha de Marketing</CardTitle>
          <CardDescription>
            Crie campanhas automatizadas para engajar seus pacientes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome da Campanha *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Recall Mensal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo desta campanha..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Campanha *</Label>
            <Select
              value={type}
              onValueChange={(value) => handleTypeChange(value as CampaignType)}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RECALL">Recall de Pacientes</SelectItem>
                <SelectItem value="POS_CONSULTA">Pós-Consulta</SelectItem>
                <SelectItem value="ANIVERSARIO">Aniversário</SelectItem>
                <SelectItem value="SEGMENTADA">Campanha Segmentada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Mensagem *</Label>
            <Textarea
              id="template"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="Digite a mensagem ou use um template..."
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use variáveis como: {"{"}
              {"{"}nomePaciente{"}"}
              {"}"}, {"{"}
              {"{"}nomeClinica{"}"}
              {"}"}, {"{"}
              {"{"}dataConsulta{"}"}
              {"}"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadPredefinedTemplate("RECALL")}
            >
              Template Recall
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadPredefinedTemplate("POS_CONSULTA")}
            >
              Template Pós-Consulta
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadPredefinedTemplate("ANIVERSARIO")}
            >
              Template Aniversário
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Campanha
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
