import { useState, useMemo, useCallback } from "react";
import { Scan, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@orthoplus/core-ui/button";
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Progress } from "@orthoplus/core-ui/progress";
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Skeleton } from "@orthoplus/core-ui/skeleton";
import { CheckCircle, Clock, Filter } from "lucide-react";
import { useRadiografia } from "@/modules/ia-radiografia/hooks/useRadiografia";
import { useConsentimento } from "@/modules/ia-radiografia/hooks/useConsentimento";
import { useAuditTrail } from "@/modules/ia-radiografia/hooks/useAuditTrail";
import { tipoRadiografiaLabels } from "@/modules/ia-radiografia/types/radiografia.types";
import type { AnaliseComplete } from "@/modules/ia-radiografia/types/radiografia.types";
import { useToast } from "@/hooks/use-toast";
import { AnaliseDetailsDialog } from "@/modules/ia-radiografia/components/AnaliseDetailsDialog";
import { AnaliseCharts } from "@/modules/ia-radiografia/components/AnaliseCharts";
import { IAInsightsDashboard } from "@/modules/ia-radiografia/components/IAInsightsDashboard";
import { RadiografiaComparison } from "@/modules/ia-radiografia/components/RadiografiaComparison";
import { PatientRadiographyTimeline } from "@/modules/ia-radiografia/components/PatientRadiographyTimeline";
import { UploadDialog } from "../components/UploadDialog";
import { AnaliseList } from "../components/AnaliseList";
import type { ConsentStatus } from "../components/UploadDialog";

export default function IARadiografia() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [selectedAnalise, setSelectedAnalise] =
    useState<AnaliseComplete | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>("loading");
  const [checkingConsent, setCheckingConsent] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [filterTipo, setFilterTipo] = useState<string>("TODOS");
  const [filterPeriodo, setFilterPeriodo] = useState<string>("TODOS");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { analises, loading, uploadRadiografia } = useRadiografia();
  const { verificarConsentimento, registrarConsentimento } = useConsentimento();
  const { logs: auditLogs, fetchAuditTrail } = useAuditTrail();
  const { toast } = useToast();

  const filteredAnalises = useMemo(() => {
    let filtered = [...analises];

    if (filterStatus !== "TODOS") {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }
    if (filterTipo !== "TODOS") {
      filtered = filtered.filter((a) => a.tipo_radiografia === filterTipo);
    }
    if (filterPeriodo !== "TODOS") {
      const now = new Date();
      const days =
        filterPeriodo === "7_DIAS" ? 7 : filterPeriodo === "30_DIAS" ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((a) => {
        const date = a.created_at ? new Date(a.created_at) : null;
        return date && date >= cutoff;
      });
    }

    return filtered;
  }, [analises, filterStatus, filterTipo, filterPeriodo]);

  const totalPages = Math.ceil(filteredAnalises.length / itemsPerPage);
  const paginatedAnalises = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAnalises.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAnalises, currentPage]);

  const handleCheckConsent = useCallback(
    async (patientId: string) => {
      if (!patientId) {
        setConsentStatus("loading");
        return;
      }
      setCheckingConsent(true);
      try {
        const status = await verificarConsentimento(patientId);
        if (status?.ativo) {
          setConsentStatus("consented");
        } else if (status?.historico.some((h) => h.revogado)) {
          setConsentStatus("revoked");
        } else {
          setConsentStatus("missing");
        }
      } catch {
        setConsentStatus("missing");
      } finally {
        setCheckingConsent(false);
      }
    },
    [verificarConsentimento],
  );

  const handlePatientChange = (value: string) => {
    setSelectedPatient(value);
    if (value) {
      handleCheckConsent(value);
    } else {
      setConsentStatus("loading");
    }
  };

  const handleRegisterConsent = async () => {
    if (!selectedPatient) return;
    try {
      await registrarConsentimento(selectedPatient);
      setConsentStatus("consented");
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao registrar consentimento", variant: "destructive" });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedPatient || !selectedTipo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos antes de enviar",
        variant: "destructive",
      });
      return;
    }
    if (consentStatus !== "consented") {
      toast({
        title: "Consentimento necessário",
        description: "O paciente precisa consentir com o processamento de IA",
        variant: "destructive",
      });
      return;
    }
    try {
      await uploadRadiografia(
        selectedPatient,
        undefined,
        selectedTipo,
        selectedFile,
      );
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedPatient("");
      setSelectedTipo("");
      setConsentStatus("loading");
    } catch (error) {
      toast({ title: "Erro", description: "Erro no upload", variant: "destructive" });
    }
  };

  const handleViewDetails = (analise: AnaliseComplete) => {
    setSelectedAnalise(analise);
    if (analise.id) {
      fetchAuditTrail(analise.id);
    }
    setDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={Scan}
          title="IA Análise de Radiografias"
          description="Detecção automática de problemas dentários via Inteligência Artificial"
        />
        <Button type="button" variant="elevated" onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Fazer Upload de Raio-X
        </Button>
      </div>

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        selectedPatient={selectedPatient}
        onPatientChange={handlePatientChange}
        consentStatus={consentStatus}
        onRegisterConsent={handleRegisterConsent}
        checkingConsent={checkingConsent}
        selectedTipo={selectedTipo}
        onTipoChange={setSelectedTipo}
        selectedFile={selectedFile}
        onFileChange={(e) =>
          e.target.files?.[0] && setSelectedFile(e.target.files[0])
        }
        onUpload={handleUpload}
      />

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">
              Total de Análises
            </div>
            <div className="text-3xl font-bold mt-2">{analises.length}</div>
            <Badge variant="success" className="mt-2">
              Radiografias analisadas
            </Badge>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">
              Problemas Detectados
            </div>
            <div className="text-3xl font-bold mt-2 text-warning">
              {analises.reduce(
                (sum, a) => sum + (a.problemas_detectados || 0),
                0,
              )}
            </div>
            <Badge variant="warning" className="mt-2">
              Requer atenção
            </Badge>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">
              Precisão Média da IA
            </div>
            <div className="text-3xl font-bold mt-2 text-success">
              {analises.length > 0
                ? Math.round(
                    analises.reduce(
                      (sum, a) => sum + (a.confidence_score || 0),
                      0,
                    ) / analises.length,
                  )
                : 0}
              %
            </div>
            <Progress
              value={
                analises.length > 0
                  ? analises.reduce(
                      (sum, a) => sum + (a.confidence_score || 0),
                      0,
                    ) / analises.length
                  : 0
              }
              className="mt-2"
            />
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">
              Em Processamento
            </div>
            <div className="text-3xl font-bold mt-2">
              {
                analises.filter(
                  (a) => a.status === "PROCESSANDO" || a.status === "PENDENTE",
                ).length
              }
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              Processando...
            </div>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Scan className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">
              Como funciona a Análise por IA?
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Nossa IA utiliza Google Gemini Vision avançada treinada com
              milhares de radiografias odontológicas para detectar
              automaticamente cáries, fraturas, problemas periodontais e outras
              condições. A precisão média é de 94%, mas sempre recomendamos
              revisão profissional.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                "Detecção de Cáries",
                "Fraturas Dentárias",
                "Problemas Periodontais",
                "Lesões Periapicais",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Dashboards */}
      {!loading && analises.length > 0 && (
        <IAInsightsDashboard analises={analises} />
      )}
      {!loading && analises.length > 0 && <AnaliseCharts analises={analises} />}
      {!loading && analises.length > 0 && (
        <RadiografiaComparison analises={analises} />
      )}
      {!loading && analises.length > 0 && <PatientRadiographyTimeline />}

      {/* Analysis List */}
      <Card className="p-6" depth="intense">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Análises Recentes</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtros:</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="filterStatus" className="text-xs">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="filterStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="PROCESSANDO">Processando</SelectItem>
                <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                <SelectItem value="ERRO">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filterTipo" className="text-xs">Tipo de Radiografia</Label>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger id="filterTipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                {Object.entries(tipoRadiografiaLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filterPeriodo" className="text-xs">Período</Label>
            <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
              <SelectTrigger id="filterPeriodo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="7_DIAS">Últimos 7 dias</SelectItem>
                <SelectItem value="30_DIAS">Últimos 30 dias</SelectItem>
                <SelectItem value="90_DIAS">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AnaliseList
          analises={paginatedAnalises}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAnalises.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onViewDetails={handleViewDetails}
        />
      </Card>

      <AnaliseDetailsDialog
        analise={selectedAnalise}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        auditLogs={auditLogs}
      />
    </div>
  );
}
