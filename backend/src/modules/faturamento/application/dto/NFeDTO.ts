import { NFe, NFeItem } from '../../domain/entities/NFe';

export class NFeDTO {
  constructor(
    public readonly id: string,
    public numero: string,
    public serie: string,
    public chaveAcesso: string | null,
    public status: string,
    public clienteNome: string,
    public clienteCpfCnpj: string,
    public items: NFeItem[],
    public valorTotal: number,
    public valorIcms: number,
    public valorIpi: number,
    public dataEmissao: Date,
    public dataAutorizacao: Date | null,
    public protocoloAutorizacao: string | null
  ) {}

  static fromEntity(nfe: NFe): NFeDTO {
    return new NFeDTO(
      nfe.id,
      nfe.numero,
      nfe.serie,
      nfe.chaveAcesso,
      nfe.status,
      nfe.clienteNome,
      nfe.clienteCpfCnpj,
      nfe.items,
      nfe.valorTotal,
      nfe.valorIcms,
      nfe.valorIpi,
      nfe.dataEmissao,
      nfe.dataAutorizacao,
      nfe.protocoloAutorizacao
    );
  }
}
