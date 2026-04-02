import { Contrato, ItemContrato } from '../../domain/entities/Contrato';

export class ContratoDTO {
  constructor(
    public readonly id: string,
    public numero: string,
    public pacienteId: string,
    public pacienteNome: string,
    public items: ItemContrato[],
    public valorTotal: number,
    public valorDesconto: number,
    public valorFinal: number,
    public status: string,
    public formaPagamento: string,
    public numeroParcelas: number,
    public dataInicio: Date,
    public dataFimPrevista: Date,
    public dataAssinatura: Date | null
  ) {}

  static fromEntity(contrato: Contrato): ContratoDTO {
    return new ContratoDTO(
      contrato.id,
      contrato.numero,
      contrato.pacienteId,
      contrato.pacienteNome,
      contrato.items,
      contrato.valorTotal,
      contrato.valorDesconto,
      contrato.valorFinal,
      contrato.status,
      contrato.formaPagamento,
      contrato.numeroParcelas,
      contrato.dataInicio,
      contrato.dataFimPrevista,
      contrato.dataAssinatura
    );
  }
}
