import type { WalletFormProps } from "./types";
import { useWalletForm } from "./hooks/useWalletForm";
import { WalletTypeSelect } from "./components/WalletTypeSelect";
import { WalletFormField } from "./components/WalletFormField";
import { MultisigToggle } from "./components/MultisigToggle";
import { AddWalletButton } from "./components/AddWalletButton";

export * from "./types";
export { WalletTypeSelect, WalletFormField, MultisigToggle, AddWalletButton };
export { useWalletForm };

export function WalletForm({ formData, onUpdate, onSubmit }: WalletFormProps) {
  const { canSubmit } = useWalletForm(formData);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <WalletFormField
          id="wallet-name"
          label="Nome da Carteira"
          placeholder="Ex: KRUX Principal"
          value={formData.name}
          onChange={(value) => onUpdate("name", value)}
        />

        <WalletTypeSelect
          value={formData.type}
          onChange={(value) => onUpdate("type", value)}
        />
      </div>

      <WalletFormField
        id="xpub"
        label="xPub (Chave Pública Estendida)"
        placeholder="xpub..."
        value={formData.xpub}
        onChange={(value) => onUpdate("xpub", value)}
        className="font-mono text-xs"
        helpText="Exporte o xPub do seu dispositivo através de QR Code ou cartão SD"
      />

      <WalletFormField
        id="fingerprint"
        label="Fingerprint (Opcional)"
        placeholder="00000000"
        value={formData.fingerprint}
        onChange={(value) => onUpdate("fingerprint", value)}
        maxLength={8}
        className="font-mono"
      />

      <MultisigToggle
        checked={formData.multisig}
        onChange={(checked) => onUpdate("multisig", checked)}
      />

      <AddWalletButton disabled={!canSubmit} onClick={onSubmit} />
    </div>
  );
}
