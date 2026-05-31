import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@orthoplus/core-ui/skeleton";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import type { AnaliseComplete } from "../types/radiografia.types";

interface TimelineData {
  data: string;
  problemas: number;
  confianca: number;
  tipo: string;
  status: string;
}

interface Patient {
  id: string;
  nome: string;
}

export const PatientRadiographyTimeline = () => {
  const { selectedClinic } = useAuth();
  const [analises, setAnalises] = useState<AnaliseComplete[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!selectedClinic?.id) return;

      try {
        setLoading(true);

        // Carregar pacientes
        const patientsData = await apiClient.get<Patient[]>("/pacientes", {
          params: { fields: "id,nome" },
        });

        setPatients(patientsData || []);

        // Carregar todas as análises
        const analisesData = await apiClient.get<AnaliseComplete[]>(
          "/ia-radiografia/analises",
        );

        setAnalises(analisesData || []);

        // Selecionar primeiro paciente com análises
        if (
          patientsData &&
          patientsData.length > 0 &&
          analisesData &&
          analisesData.length > 0
        ) {
          const firstPatientWithAnalysis = patientsData.find((p) =>
            analisesData.some((a) => a.paciente_id === p.id),
          );
          if (firstPatientWithAnalysis) {
            setSelectedPatientId(firstPatientWithAnalysis.id);
          }
        }
      } catch (error) {
        toast.error("Erro ao carregar timeline");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedClinic]);

  const patientAnalises = useMemo(() => {
    if (!selectedPatientId) return [];
    return analises
      .filter((a) => a.paciente_id === selectedPatientId)
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });
  }, [analises, selectedPatientId]);

  const timelineData: TimelineData[] = useMemo(() => {
    return patientAnalises.map((analise) => ({
      data: analise.created_at
        ? new Date(analise.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })
        : "--/--",
      problemas: analise.problemas_detectados || 0,
      confianca: Math.round(
        (analise.confidence_score || 0) *
          (analise.confidence_score && analise.confidence_score <= 1 ? 100 : 1),
      ),
      tipo: analise.tipo_radiografia,
      status: analise.status,
    }));
  }, [patientAnalises]);

  const tendenciaProblemas = useMemo(() => {
    if (timelineData.length < 2) return "estavel";
    const primeiro = timelineData[0].problemas;
    const ultimo = timelineData[timelineData.length - 1].problemas;
    if (ultimo > primeiro) return "aumentando";
    if (ultimo < primeiro) return "diminuindo";
    return "estavel";
  }, [timelineData]);

  const getTendenciaIcon = () => {
    if (tendenciaProblemas === "aumentando")
      return <TrendingUp className="h-5 w-5 text-destructive" />;
    if (tendenciaProblemas === "diminuindo")
      return <TrendingDown className="h-5 w-5 text-success" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getTendenciaText = () => {
    if (tendenciaProblemas === "aumentando") return "Problemas aumentando";
    if (tendenciaProblemas === "diminuindo") return "Melhoria detectada";
    return "Estável";
  };

  const getTendenciaVariant = ():
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "info"
    | "warning"
    | "success" => {
    if (tendenciaProblemas === "aumentando") return "destructive";
    if (tendenciaProblemas === "diminuindo") return "success";
    return "outline";
  };

  if (loading) {
    return (
      <Card className="p-6" depth="normal">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    );
  }

  if (patients.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhum paciente cadastrado. Cadastre pacientes para visualizar o
          histórico de radiografias.
        </AlertDescription>
      </Alert>
    );
  }

  if (!selectedPatientId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Selecione um paciente para visualizar o histórico de radiografias.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-6" depth="normal">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline de Evolução do Paciente
            </h3>
            <p className="text-sm text-muted-foreground">
              Histórico completo de radiografias e tendências de tratamento
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={getTendenciaVariant()}
              className="flex items-center gap-2"
            >
              {getTendenciaIcon()}
              {getTendenciaText()}
            </Badge>
          </div>
        </div>

        <div>
          <label
            htmlFor="patient-select"
            className="text-sm font-medium mb-2 block"
          >
            Selecione o Paciente
          </label>
          <Select
            value={selectedPatientId}
            onValueChange={setSelectedPatientId}
          >
            <SelectTrigger id="patient-select" className="w-full">
              <SelectValue placeholder="Selecione um paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {patientAnalises.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma radiografia encontrada para este paciente.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Gráfico de Tendência */}
            <div className="bg-card rounded-lg p-4 border border-border/50">
              <h4 className="text-sm font-semibold mb-4">
                Gráfico de Tendência
              </h4>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted/30"
                    />
                    <XAxis
                      dataKey="data"
                      className="text-[10px] uppercase tracking-wider"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      className="text-[10px]"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="problemas"
                      name="Problemas Detectados"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={3}
                      dot={{
                        fill: "hsl(var(--destructive))",
                        r: 4,
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="confianca"
                      name="Confiança da IA (%)"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{
                        fill: "hsl(var(--primary))",
                        r: 4,
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lista de Análises */}
            <div>
              <h4 className="text-sm font-semibold mb-4">
                Histórico Detalhado
              </h4>
              <div className="space-y-3">
                {[...patientAnalises].reverse().map((analise, index) => (
                  <div
                    key={analise.id}
                    className="flex items-center gap-4 p-4 border rounded-xl hover:bg-accent/30 transition-all group"
                  >
                    <div className="flex-shrink-0 text-center w-16">
                      <div className="text-[10px] text-muted-foreground font-mono uppercase">
                        Ref #{patientAnalises.length - index}
                      </div>
                      <div className="text-sm font-bold text-foreground">
                        {analise.created_at
                          ? new Date(analise.created_at).toLocaleDateString(
                              "pt-BR",
                              { day: "2-digit", month: "short" },
                            )
                          : "--/--"}
                      </div>
                    </div>
                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted border border-border/50 flex-shrink-0">
                      <img
                        src={analise.imagem_url}
                        alt="Miniatura Radiográfica"
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 px-1.5"
                        >
                          {analise.tipo_radiografia}
                        </Badge>
                        <Badge
                          variant={
                            analise.status === "CONCLUIDA"
                              ? "success"
                              : "warning"
                          }
                          className="text-[10px] h-5 px-1.5"
                        >
                          {analise.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <strong className="text-foreground">
                            {analise.problemas_detectados || 0}
                          </strong>{" "}
                          anomalia(s)
                        </span>
                        <span className="flex items-center gap-1">
                          Confiança:{" "}
                          <strong
                            className={`font-bold ${
                              (analise.confidence_score || 0) > 0.8 ||
                              (analise.confidence_score || 0) > 80
                                ? "text-success"
                                : "text-warning"
                            }`}
                          >
                            {Math.round(
                              (analise.confidence_score || 0) *
                                (analise.confidence_score &&
                                analise.confidence_score <= 1
                                  ? 100
                                  : 1),
                            )}
                            %
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estatísticas Resumidas */}
            <div className="grid grid-cols-3 gap-4 pt-6 mt-2 border-t border-border/50">
              <div className="text-center p-3 rounded-lg bg-accent/20">
                <div className="text-2xl font-black text-primary">
                  {patientAnalises.length}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Exames
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/20">
                <div className="text-2xl font-black text-destructive">
                  {patientAnalises.reduce(
                    (sum, a) => sum + (a.problemas_detectados || 0),
                    0,
                  )}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Anomalias
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/20">
                <div className="text-2xl font-black text-success">
                  {patientAnalises.length > 0
                    ? Math.round(
                        (patientAnalises.reduce(
                          (sum, a) => sum + (a.confidence_score || 0),
                          0,
                        ) /
                          (patientAnalises.length *
                            (patientAnalises[0].confidence_score &&
                            patientAnalises[0].confidence_score > 1
                              ? 100
                              : 1))) *
                          100,
                      )
                    : 0}
                  %
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Precisão
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
