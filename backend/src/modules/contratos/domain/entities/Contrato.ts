export interface ItemContrato {
  procedimentoId: string;
  procedimentoNome: string;
  quantidade: number;
  valorUnitario: number;
  desconto: number;
  valorTotal: number;
}

export class Contrato {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public numero: string,
    public pacienteId: string,
    public pacienteNome: string,
    public items: ItemContrato[],
    public valorTotal: number,
    public valorDesconto: number,
    public valorFinal: number,
    public status: 'RASCUNHO' | 'PENDENTE_ASSINATURA' | 'ASSINADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO',
    public formaPagamento: 'AVISTA' | 'PARCELADO' | 'MENSALIDADE',
    public numeroParcelas: number,
    public dataInicio: Date,
    public dataFimPrevista: Date,
    public dataAssinatura: Date | null,
    public assinaturaDigital: string | null,
    public observacoes: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(props: Omit<Contrato, 'assinar' | 'cancelar'>): Contrato {
    return new Contrato(
      props.id,
      props.clinicId,
      props.numero,
      props.pacienteId,
      props.pacienteNome,
      props.items,
      props.valorTotal,
      props.valorDesconto,
      props.valorFinal,
      props.status,
      props.formaPagamento,
      props.numeroParcelas,
      props.dataInicio,
      props.dataFimPrevista,
      props.dataAssinatura,
      props.assinaturaDigital,
      props.observacoes,
      props.createdAt,
      props.updatedAt
    );
  }

  assinar(assinaturaDigital: string): void {
    if (this.status !== 'PENDENTE_ASSINATURA') {
      throw new Error('Contrato não está pendente de assinatura');
    }
    this.status = 'ASSINADO';
    this.assinaturaDigital = assinaturaDigital;
    this.dataAssinatura = new Date();
    this.updatedAt = new Date();
  }

  cancelar(): void {
    if (['CONCLUIDO'].includes(this.status)) {
      throw new Error('Não é possível cancelar um contrato concluído');
    }
    this.status = 'CANCELADO';
    this.updatedAt = new Date();
  }
}
