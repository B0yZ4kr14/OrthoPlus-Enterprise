import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePatients } from "@/modules/pacientes/hooks/usePatientsUnified";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Plus, UserCircle, Phone, Calendar, AlertTriangle, Users, ChevronRight, Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RiskScoreBadge } from "@/components/patients/RiskScoreBadge";
import { PatientAvatar } from "@/components/patients/PatientAvatar";
import { TableFilter } from "@/components/shared/TableFilter";
import { StatsCard } from "@/components/shared/StatsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Patient } from "@/types/patient";
import { getStatusTextColor } from "@/lib/utils/status.utils";
import { CardTopBorder } from "@/components/shared/CardTopBorder";
import { cn } from "@/lib/utils";

export default function PacientesListPage() {
  const { clinicId } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { patients, loading: isLoading } = usePatients();

  const filteredPatients =
    patients?.filter((patient) => {
      const matchesSearch =
        !searchTerm ||
        patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cpf?.includes(searchTerm) ||
        patient.phone_primary?.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || patient.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  const totalCount = filteredPatients?.length || 0;
  const activeCount = filteredPatients?.filter((p) => p.status === "ativo")?.length || 0;
  const highRiskCount = filteredPatients?.filter((p) => p.risk_level === "alto" || p.risk_level === "critico")?.length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Pacientes"
        description="Gestão completa de pacientes com ficha clínica profissional"
        actions={
          <Button variant="default" onClick={() => navigate("/pacientes/novo")} className="gap-2 glow-interactive" data-testid="patients-new-button">
            <Plus className="h-4 w-4" />
            Novo Paciente
          </Button>
        }
      />

      <TableFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nome, CPF ou telefone..."
        data-testid="patients-filter"
        filters={[
          {
            label: "Status",
            value: statusFilter,
            options: [
              { label: "Todos", value: "all" },
              { label: "Ativos", value: "ativo" },
              { label: "Inativos", value: "inativo" },
              { label: "Arquivados", value: "arquivado" },
            ],
            onChange: setStatusFilter,
          },
        ]}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("all");
        }}
      />

      {/* Stats Premium */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total"
          value={totalCount}
          icon={UserCircle}
          variant="primary"
          description="Pacientes cadastrados"
        />
        <StatsCard
          title="Ativos"
          value={activeCount}
          icon={UserCircle}
          variant="success"
          description="Pacientes em tratamento"
        />
        <StatsCard
          title="Alto Risco"
          value={highRiskCount}
          icon={AlertTriangle}
          variant="warning"
          description="Alto risco ou crítico"
        />
        <StatsCard
          title="Consultas Hoje"
          value={0}
          icon={Calendar}
          variant="default"
          description="Agendadas para hoje"
        />
      </div>

      {/* Patient List Premium */}
      <Card className="glass-card overflow-hidden" data-testid="patients-list-card">
        <CardTopBorder color="interactive" opacity={30} />
        <div className="divide-y divide-border/40">
          {filteredPatients.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Users}
                message="Nenhum paciente encontrado"
                description={searchTerm || statusFilter !== "all" ? "Tente ajustar os filtros de busca." : "Cadastre seu primeiro paciente para começar."}
                action={{ label: "Novo Paciente", onClick: () => navigate("/pacientes/novo") }}
              />
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => navigate(`/pacientes/${patient.id}`)}
                className="p-4 hover:bg-muted/20 cursor-pointer transition-all duration-200 group"
                data-testid={`patient-list-item-${patient.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <PatientAvatar name={patient.full_name} />
                    <div>
                      <p className="font-semibold text-sm text-foreground group-hover:text-interactive transition-colors">
                        {patient.full_name}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {patient.phone_primary && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone_primary}
                          </span>
                        )}
                        {patient.cpf && <span className="text-muted-foreground/60">CPF: {patient.cpf}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <RiskScoreBadge
                        riskLevel={patient.risk_level}
                        overallScore={patient.risk_score_overall}
                      />
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] capitalize", getStatusTextColor(patient.status || "ativo"))}
                      >
                        {patient.status || "ativo"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pacientes/${patient.id}`);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pacientes/editar/${patient.id}`);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
