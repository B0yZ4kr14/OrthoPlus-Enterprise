import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";

export function IncludedDataAlert() {
  return (
    <Alert>
      <AlertDescription>
        <strong>Dados incluídos na exportação:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
          <li>Informações da clínica</li>
          <li>Cadastros de pacientes</li>
          <li>Prontuários e anamneses</li>
          <li>Agenda e consultas</li>
          <li>Dados financeiros</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}

export function LGPDAlert() {
  return (
    <Alert>
      <AlertDescription className="text-sm">
        <strong>Conformidade LGPD:</strong> Todas as exportações são registradas no audit log
        para fins de compliance e rastreabilidade.
      </AlertDescription>
    </Alert>
  );
}
