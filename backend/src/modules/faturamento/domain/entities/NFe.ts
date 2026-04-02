export interface NFeItem {
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export class NFe {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public numero: string,
    public serie: string,
    public chaveAcesso: string | null,
    public status: 'RASCUNHO' | 'EMITIDA' | 'AUTORIZADA' | 'CANCELADA' | 'DENEGADA',
    public clienteId: string,
    public clienteNome: string,
    public clienteCpfCnpj: string,
    public items: NFeItem[],
    public valorTotal: number,
    public valorIcms: number,
    public valorIpi: number,
    public dataEmissao: Date,
    public dataAutorizacao: Date | null,
    public protocoloAutorizacao: string | null,
    public observacoes: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(props: Omit<NFe, 'autorizar' | 'cancelar'>): NFe {
    return new NFe(
      props.id,
      props.clinicId,
      props.numero,
      props.serie,
      props.chaveAcesso,
      props.status,
      props.clienteId,
      props.clienteNome,
      props.clienteCpfCnpj,
      props.items,
      props.valorTotal,
      props.valorIcms,
      props.valorIpi,
      props.dataEmissao,
      props.dataAutorizacao,
      props.protocoloAutorizacao,
      props.observacoes,
      props.createdAt,
      props.updatedAt
    );
  }

  autorizar(protocolo: string, chave: string): void {
    if (this.status !== 'EMITIDA') {
      throw new Error('Apenas NFe emitida pode ser autorizada');
    }
    this.status = 'AUTORIZADA';
    this.protocoloAutorizacao = protocolo;
    this.chaveAcesso = chave;
    this.dataAutorizacao = new Date();
    this.updatedAt = new Date();
  }

  cancelar(): void {
    if (this.status !== 'AUTORIZADA') {
      throw new Error('Apenas NFe autorizada pode ser cancelada');
    }
    this.status = 'CANCELADA';
    this.updatedAt = new Date();
  }
}
