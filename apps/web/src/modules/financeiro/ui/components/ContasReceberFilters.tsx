import React from "react";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
} from "lucide-react";

export interface ContasReceberFormData {
  patient_name: string;
  descricao: string;
  valor: string;
  data_vencimento: string;
  parcelas: string;
  observacoes: string;
}

interface ContasReceberFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterPeriodo: string;
  onFilterPeriodoChange: (value: string) => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onOpenNovaConta: () => void;
}

export function ContasReceberFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterPeriodo,
  onFilterPeriodoChange,
  onExportPDF,
  onExportExcel,
  onOpenNovaConta,
}: ContasReceberFiltersProps) {
  return (
    <Card variant="elevated">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou descrição..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="atrasado">Atrasadas</SelectItem>
                <SelectItem value="pago">Pagas</SelectItem>
                <SelectItem value="parcial">Pagamento Parcial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPeriodo} onValueChange={onFilterPeriodoChange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes-atual">Mês Atual</SelectItem>
                <SelectItem value="30-dias">Últimos 30 dias</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Select
              onValueChange={(value) =>
                value === "pdf" ? onExportPDF() : onExportExcel()
              }
            >
              <SelectTrigger className="w-[150px]">
                <Download className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Exportar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">Exportar PDF</SelectItem>
                <SelectItem value="excel">Exportar Excel</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="elevated" className="gap-2" onClick={onOpenNovaConta}>
              <Plus className="h-4 w-4" />
              Nova Conta a Receber
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
