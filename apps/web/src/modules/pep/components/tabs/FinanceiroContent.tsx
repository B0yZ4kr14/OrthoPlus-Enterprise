interface FinanceiroContentProps {
  patientId: string;
}

export default function FinanceiroContent({
  patientId,
}: FinanceiroContentProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium">Financeiro</h3>
      <p className="text-muted-foreground">
        Resumo financeiro do paciente {patientId}
      </p>
    </div>
  );
}
