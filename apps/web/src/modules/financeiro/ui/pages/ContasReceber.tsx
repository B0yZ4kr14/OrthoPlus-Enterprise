import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@orthoplus/core-ui/card";
import { DollarSign } from "lucide-react";
import { PaymentDialog } from "@/components/financeiro/PaymentDialog";

import { useContasReceberController } from "../../application/hooks/useContasReceberController";
import { ContasReceberKPIs } from "../components/ContasReceberKPIs";
import { ContasReceberChart } from "../components/ContasReceberChart";
import {
  ContasReceberFilters,
  type ContasReceberFormData,
} from "../components/ContasReceberFilters";
import { ContasReceberTable } from "../components/ContasReceberTable";
import { NovaContaWizard } from "../components/NovaContaWizard";

export default function ContasReceber() {
  const { state, actions } = useContasReceberController();

  const handleNovaContaSubmit = async (formData: ContasReceberFormData) => {
    try {
      await actions.addContaReceber({
        patient_name: formData.patient_name,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        valor_pago: 0,
        data_vencimento: formData.data_vencimento,
        status: "pendente",
        parcelas: parseInt(formData.parcelas || "1"),
        parcela_atual: 1,
        observacoes: formData.observacoes,
      });
    } catch (error) {
      toast.error("Erro ao criar conta");
    }
  };

  if (state.loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-muted-foreground">
          Carregando contas a receber...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={DollarSign}
        title="Contas a Receber"
        description="Gerencie pagamentos de pacientes e cobranças"
      />

      <ContasReceberKPIs contasReceber={state.contasReceber} />

      <ContasReceberChart contasReceber={state.contasReceber} />

      <ContasReceberFilters
        searchTerm={state.searchTerm}
        onSearchChange={actions.setSearchTerm}
        filterStatus={state.filterStatus}
        onFilterStatusChange={actions.setFilterStatus}
        filterPeriodo={state.filterPeriodo}
        onFilterPeriodoChange={actions.setFilterPeriodo}
        onExportPDF={actions.exportarPDF}
        onExportExcel={actions.exportarExcel}
        onOpenNovaConta={() => actions.setDialogOpen(true)}
      />

      <Card variant="elevated">
        <ContasReceberTable
          contas={state.filteredContas}
          sendingCobranca={state.sendingCobranca}
          onEnviarCobranca={actions.handleEnviarCobranca}
          onOpenPayment={actions.handleOpenPayment}
        />
      </Card>

      <NovaContaWizard
        open={state.dialogOpen}
        onOpenChange={actions.setDialogOpen}
        onSubmit={handleNovaContaSubmit}
      />

      {state.selectedConta && (
        <PaymentDialog
          open={state.paymentDialogOpen}
          onClose={() => {
            actions.setPaymentDialogOpen(false);
            actions.setSelectedConta(null);
          }}
          conta={state.selectedConta}
          onSuccess={() => {
            actions.setPaymentDialogOpen(false);
            actions.setSelectedConta(null);
          }}
        />
      )}
    </div>
  );
}
