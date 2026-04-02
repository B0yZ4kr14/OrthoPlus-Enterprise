interface DocumentosContentProps {
  patientId: string;
}

export default function DocumentosContent({
  patientId,
}: DocumentosContentProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium">Documentos</h3>
      <p className="text-muted-foreground">
        Documentos do paciente {patientId}
      </p>
    </div>
  );
}
