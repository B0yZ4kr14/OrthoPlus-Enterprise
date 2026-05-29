import { useState } from "react";
import {
  Database,
  Server,
  Activity,
  HardDrive,
  Layers,
  Globe,
  Shield,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DatabaseAdvancedPanel } from "../components/database/DatabaseAdvancedPanel";
import { BackupLocalCard } from "../components/database/BackupLocalCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Skeleton } from "@orthoplus/core-ui/skeleton";
import { useDatabaseCategories } from "../../hooks/useDatabaseCategories";
import { CategoryBackupPanel } from "../components/database/CategoryBackupPanel";

/** Mapeamento estático de schemas por categoria (fallback) */
const CATEGORY_SCHEMAS: Record<string, string[]> = {
  CORE: ["core", "pacientes", "pep"],
  FINANCEIRO: ["financeiro", "pdv", "faturamento", "crypto_config"],
  OPERACIONAL: ["operacional", "inventario"],
  COMERCIAL: ["comercial"],
  CLINICO: ["clinico"],
  ADMINISTRATIVO: [
    "administrativo",
    "configuracoes",
    "database_admin",
    "backups",
  ],
};

export default function DatabaseManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("MASTER");
  const {
    categories,
    isLoadingCategories,
    masterHealth,
    isLoadingHealth,
    masterStats,
    isLoadingStats,
  } = useDatabaseCategories();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-success";
      case "degraded":
        return "bg-warning";
      case "down":
        return "bg-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge variant="success">Saudável</Badge>;
      case "degraded":
        return <Badge variant="warning">Degradado</Badge>;
      case "down":
        return <Badge variant="destructive">Indisponível</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciamento de Banco de Dados"
        description="Controle avançado dos motores de banco de dados, backups e manutenções do sistema."
        icon={Database}
      />

      {/* Seletor de Categoria */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Categoria:</span>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MASTER">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>MASTER — Visão Federada (Todas)</span>
                  </div>
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
                {/* Fallback se API não retornar */}
                {categories.length === 0 &&
                  Object.keys(CATEGORY_SCHEMAS).map((name) => (
                    <SelectItem key={name} value={name}>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span>{name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {selectedCategory !== "MASTER" && (
              <p className="text-sm text-muted-foreground">
                {categories.find((c) => c.name === selectedCategory)
                  ?.description ||
                  `Schemas: ${CATEGORY_SCHEMAS[selectedCategory]?.join(", ")}`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visão MASTER — Federation Hub */}
      {selectedCategory === "MASTER" && (
        <div className="space-y-6">
          {/* Status Geral */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Status Geral
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingHealth ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${getStatusColor(
                        masterHealth?.overallStatus ?? "down",
                      )}`}
                    />
                    <span className="text-2xl font-bold capitalize">
                      {masterHealth?.overallStatus === "healthy"
                        ? "Saudável"
                        : masterHealth?.overallStatus === "degraded"
                          ? "Degradado"
                          : "Indisponível"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Categorias
                </CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {masterStats?.totalCategories ?? 0}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tabelas Totais
                </CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {masterStats?.totalTables ?? 0}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tamanho Total
                </CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">
                    {masterStats?.totalSizeHuman ?? "0 B"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Observabilidade / Prometheus */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Observabilidade</p>
                    <p className="text-xs text-muted-foreground">
                      Métricas Prometheus coletadas a cada 10s
                    </p>
                  </div>
                </div>
                <a
                  href="/grafana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Grafana <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Health por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Health Check por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingHealth
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))
                : masterHealth?.categories.map((cat) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-3 w-3 rounded-full ${getStatusColor(cat.status)}`}
                        />
                        <div>
                          <p className="font-medium">{cat.category}</p>
                          <p className="text-sm text-muted-foreground">
                            Schemas: {cat.schemas.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {cat.schemasFound.length}/{cat.schemas.length} schemas
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {cat.latencyMs}ms
                        </span>
                        {getStatusBadge(cat.status)}
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>

          {/* Stats por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">
                        Categoria
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Schemas
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        Tabelas
                      </th>
                      <th className="text-right py-3 px-4 font-medium">
                        Tamanho
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingStats
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>
                            <td colSpan={4}>
                              <Skeleton className="h-10 w-full my-1" />
                            </td>
                          </tr>
                        ))
                      : masterStats?.categories.map((cat) => (
                          <tr
                            key={cat.category}
                            className="border-b hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium">
                              {cat.category}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {cat.schemas.join(", ")}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {cat.tableCount}
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              {cat.sizeHuman}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Backups por Categoria */}
          <CategoryBackupPanel />
        </div>
      )}

      {/* Visão por Categoria Específica */}
      {selectedCategory !== "MASTER" && (
        <DatabaseAdvancedPanel
          category={selectedCategory}
          categorySchemas={
            categories.find((c) => c.name === selectedCategory)?.schemas ??
            CATEGORY_SCHEMAS[selectedCategory] ??
            []
          }
        />
      )}

      <BackupLocalCard />
    </div>
  );
}
