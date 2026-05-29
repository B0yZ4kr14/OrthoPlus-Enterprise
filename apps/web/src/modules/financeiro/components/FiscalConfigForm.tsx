import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Settings, Save } from "lucide-react";

interface FiscalConfig {
  cnpj_emitente?: string;
  razao_social?: string;
  serie_nfe?: string;
  serie_nfce?: string;
  ambiente: string;
  certificado_a1_path?: string;
  certificado_senha?: string;
  certificado_vencimento?: string;
  regime_tributario?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
}

interface Props {
  config: FiscalConfig | null;
  onSave: (data: Partial<FiscalConfig>) => void;
  isLoading: boolean;
  isSaving: boolean;
}

export function FiscalConfigForm({
  config,
  onSave,
  isLoading,
  isSaving,
}: Props) {
  const [form, setForm] = useState<Partial<FiscalConfig>>({
    ambiente: "homologacao",
  });

  useEffect(() => {
    if (config) {
      setForm(config);
    }
  }, [config]);

  const handleChange = (field: keyof FiscalConfig, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Carregando configuração...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          Configuração Fiscal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ Emitente</Label>
              <Input
                id="cnpj"
                value={form.cnpj_emitente || ""}
                onChange={(e) => handleChange("cnpj_emitente", e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razao">Razão Social</Label>
              <Input
                id="razao"
                value={form.razao_social || ""}
                onChange={(e) => handleChange("razao_social", e.target.value)}
                placeholder="Razão Social do Emitente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serie_nfe">Série NF-e</Label>
              <Input
                id="serie_nfe"
                value={form.serie_nfe || ""}
                onChange={(e) => handleChange("serie_nfe", e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serie_nfce">Série NFC-e</Label>
              <Input
                id="serie_nfce"
                value={form.serie_nfce || ""}
                onChange={(e) => handleChange("serie_nfce", e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Ambiente</Label>
              <Select
                value={form.ambiente || "homologacao"}
                onValueChange={(v) => handleChange("ambiente", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homologacao">Homologação</SelectItem>
                  <SelectItem value="producao">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="regime">Regime Tributário</Label>
              <Select
                value={form.regime_tributario || ""}
                onValueChange={(v) => handleChange("regime_tributario", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples_nacional">
                    Simples Nacional
                  </SelectItem>
                  <SelectItem value="lucro_presumido">
                    Lucro Presumido
                  </SelectItem>
                  <SelectItem value="lucro_real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ie">Inscrição Estadual</Label>
              <Input
                id="ie"
                value={form.inscricao_estadual || ""}
                onChange={(e) =>
                  handleChange("inscricao_estadual", e.target.value)
                }
                placeholder="000.000.000.000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="im">Inscrição Municipal</Label>
              <Input
                id="im"
                value={form.inscricao_municipal || ""}
                onChange={(e) =>
                  handleChange("inscricao_municipal", e.target.value)
                }
                placeholder="000.000.000.000"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cert_path">Caminho Certificado A1</Label>
              <Input
                id="cert_path"
                value={form.certificado_a1_path || ""}
                onChange={(e) =>
                  handleChange("certificado_a1_path", e.target.value)
                }
                placeholder="/caminho/para/certificado.pfx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert_senha">Senha do Certificado</Label>
              <Input
                id="cert_senha"
                type="password"
                value={form.certificado_senha || ""}
                onChange={(e) =>
                  handleChange("certificado_senha", e.target.value)
                }
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert_venc">Vencimento do Certificado</Label>
              <Input
                id="cert_venc"
                type="date"
                value={form.certificado_vencimento || ""}
                onChange={(e) =>
                  handleChange("certificado_vencimento", e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar Configuração"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
