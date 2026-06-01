import { useState } from "react";
import { Copy, FileCode, Check } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { useToast } from "@orthoplus/core-hooks";
import {
  useCategoryDatabase,
  CategoryDatabase,
} from "@/hooks/useCategoryDatabase";

interface TemplatesTabProps {
  category: string;
  categorySchemas: string[];
}

const FALLBACK_TEMPLATES: Record<string, { name: string; ddl: string }[]> = {
  CORE: [
    {
      name: "patients",
      ddl: "CREATE TABLE pacientes.patients (\n  id UUID PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);",
    },
    {
      name: "appointments",
      ddl: "CREATE TABLE core.appointments (\n  id UUID PRIMARY KEY,\n  patient_id UUID REFERENCES pacientes.patients(id),\n  scheduled_at TIMESTAMPTZ NOT NULL\n);",
    },
    {
      name: "profiles",
      ddl: "CREATE TABLE core.profiles (\n  id UUID PRIMARY KEY,\n  user_id UUID NOT NULL,\n  clinic_id UUID NOT NULL\n);",
    },
  ],
  FINANCEIRO: [
    {
      name: "financial_transactions",
      ddl: "CREATE TABLE financeiro.financial_transactions (\n  id UUID PRIMARY KEY,\n  amount DECIMAL(10,2) NOT NULL,\n  type VARCHAR(50) NOT NULL\n);",
    },
    {
      name: "contas_pagar",
      ddl: "CREATE TABLE financeiro.contas_pagar (\n  id UUID PRIMARY KEY,\n  valor DECIMAL(10,2) NOT NULL,\n  vencimento DATE NOT NULL\n);",
    },
    {
      name: "contas_receber",
      ddl: "CREATE TABLE financeiro.contas_receber (\n  id UUID PRIMARY KEY,\n  valor DECIMAL(10,2) NOT NULL,\n  vencimento DATE NOT NULL\n);",
    },
  ],
  OPERACIONAL: [
    {
      name: "produtos",
      ddl: "CREATE TABLE inventario.produtos (\n  id UUID PRIMARY KEY,\n  nome VARCHAR(255) NOT NULL,\n  estoque_atual INTEGER DEFAULT 0\n);",
    },
    {
      name: "movimentacoes_estoque",
      ddl: "CREATE TABLE inventario.movimentacoes_estoque (\n  id UUID PRIMARY KEY,\n  produto_id UUID NOT NULL,\n  quantidade INTEGER NOT NULL\n);",
    },
  ],
  COMERCIAL: [
    {
      name: "crm_leads",
      ddl: "CREATE TABLE comercial.crm_leads (\n  id UUID PRIMARY KEY,\n  nome VARCHAR(255) NOT NULL,\n  status VARCHAR(50) DEFAULT 'novo'\n);",
    },
    {
      name: "campanhas_marketing",
      ddl: "CREATE TABLE comercial.campanhas_marketing (\n  id UUID PRIMARY KEY,\n  titulo VARCHAR(255) NOT NULL,\n  ativa BOOLEAN DEFAULT true\n);",
    },
  ],
  CLINICO: [
    {
      name: "teleconsultas",
      ddl: "CREATE TABLE clinico.teleconsultas (\n  id UUID PRIMARY KEY,\n  patient_id UUID NOT NULL,\n  scheduled_at TIMESTAMPTZ NOT NULL\n);",
    },
    {
      name: "tiss_guides",
      ddl: "CREATE TABLE clinico.tiss_guides (\n  id UUID PRIMARY KEY,\n  numero_guia VARCHAR(100) NOT NULL\n);",
    },
  ],
  ADMINISTRATIVO: [
    {
      name: "clinic_modules",
      ddl: "CREATE TABLE configuracoes.clinic_modules (\n  id UUID PRIMARY KEY,\n  module_id VARCHAR(100) NOT NULL,\n  enabled BOOLEAN DEFAULT true\n);",
    },
    {
      name: "audit_logs",
      ddl: "CREATE TABLE administrativo.audit_logs (\n  id UUID PRIMARY KEY,\n  action VARCHAR(255) NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);",
    },
  ],
};

export function TemplatesTab({ category, categorySchemas }: TemplatesTabProps) {
  const { showSuccess } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Note: we inject this for completeness, even if static templates are used
  // The prompt said to use useCategoryDatabase here
  const { stats } = useCategoryDatabase(category as CategoryDatabase);

  const templates = FALLBACK_TEMPLATES[category] || FALLBACK_TEMPLATES.CORE;

  const handleCopy = (id: string, ddl: string) => {
    navigator.clipboard.writeText(ddl);
    setCopiedId(id);
    showSuccess("DDL copiado para a área de transferência");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const fullDDL = templates.map((t) => t.ddl).join("\n\n");
    const blob = new Blob([fullDDL], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema_${category.toLowerCase()}.sql`;
    a.click();
    URL.revokeObjectURL(url);

    showSuccess("Schema SQL gerado com sucesso.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <FileCode className="w-5 h-5 text-interactive" />
            Templates de tabelas para PostgreSQL
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Schemas suportados nesta categoria:{" "}
            <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
              {categorySchemas.join(", ")}
            </span>
            {stats && ` • Tabelas ativas: ${stats.tableCount}`}
          </p>
        </div>
        <Button type="button"
          onClick={handleExport}
          variant="outline"
          className="border-border hover:bg-muted text-foreground"
        >
          📄 Exportar Schema
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {templates.map((tpl, idx) => (
          <Card key={idx} className="border border-border bg-card">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-medium text-foreground">{tpl.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => handleCopy(`${category}-${idx}`, tpl.ddl)}
                >
                  {copiedId === `${category}-${idx}` ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <div className="p-4 bg-muted/50 rounded-b-lg">
                <pre className="text-xs text-success font-mono whitespace-pre-wrap">
                  {tpl.ddl}
                </pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
