import { QrCode } from "lucide-react";

export function CupomFooter() {
  return (
    <>
      <div className="center">
        <p className="bold">FORMA DE PAGAMENTO</p>
        <p>Dinheiro</p>
      </div>

      <div className="divider"></div>

      <div className="center text-xs">
        <div className="flex items-center justify-center gap-2 my-4">
          <QrCode className="h-16 w-16" />
        </div>
        <p>Consulte pela Chave de Acesso em:</p>
        <p>www.fazenda.sp.gov.br/nfce</p>
        <p className="mt-2">Chave de Acesso:</p>
        <p className="break-all">
          3525 0100 0000 0000 0000 6500 1000 0000 0011 2345 6789
        </p>
      </div>

      <div className="divider"></div>

      <div className="center text-xs">
        <p>Data: {new Date().toLocaleString("pt-BR")}</p>
        <p className="mt-2">Protocolo de Autorização: 999123456789012345</p>
      </div>

      <div className="divider"></div>

      <div className="center text-xs">
        <p>OBRIGADO PELA PREFERÊNCIA!</p>
        <p className="mt-2">
          OrthoPlus Enterprise - Sistema de Gestão Odontológica
        </p>
      </div>
    </>
  );
}
