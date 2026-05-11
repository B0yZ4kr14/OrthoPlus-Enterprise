interface CupomHeaderProps {
  clinicName?: string;
  systemName?: string;
  cnpj?: string;
  address?: string;
}

export function CupomHeader({
  clinicName = "CLÍNICA ODONTOLÓGICA",
  systemName = "OrthoPlus Enterprise Sistema",
  cnpj = "CNPJ: 00.000.000/0000-00",
  address = "Rua Exemplo, 123 - São Paulo/SP",
}: CupomHeaderProps) {
  return (
    <>
      <div className="center bold">
        <p className="text-lg">{clinicName}</p>
        <p>{systemName}</p>
        <p className="text-xs mt-2">{cnpj}</p>
        <p className="text-xs">{address}</p>
      </div>

      <div className="divider"></div>

      <div className="center bold">
        <p>CUPOM FISCAL ELETRÔNICO - SAT</p>
        <p className="text-xs">NFCe</p>
      </div>

      <div className="divider"></div>
    </>
  );
}
