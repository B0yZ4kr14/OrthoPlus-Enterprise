// cspell:disable
export function InfoBox() {
  return (
    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
      <p className="text-sm font-medium">ℹ️ Informações importantes:</p>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
        <li>O equipamento SAT/MFe deve estar homologado pela SEFAZ</li>
        <li>Mantenha o código de ativação em local seguro</li>
        <li>Verifique se o driver do equipamento está instalado</li>
        <li>Para MFe em rede, certifique-se que o IP está correto</li>
      </ul>
    </div>
  );
}
