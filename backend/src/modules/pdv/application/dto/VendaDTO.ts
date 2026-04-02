import { Venda, ItemVenda } from '../../domain/entities/Venda';

export class VendaDTO {
  constructor(
    public readonly id: string,
    public readonly caixaId: string,
    public items: ItemVenda[],
    public total: number,
    public desconto: number,
    public totalFinal: number,
    public formaPagamento: string,
    public status: string,
    public clienteId: string | null,
    public observacoes: string | null,
    public readonly createdAt: Date
  ) {}

  static fromEntity(venda: Venda): VendaDTO {
    return new VendaDTO(
      venda.id,
      venda.caixaId,
      venda.items,
      venda.total,
      venda.desconto,
      venda.totalFinal,
      venda.formaPagamento,
      venda.status,
      venda.clienteId,
      venda.observacoes,
      venda.createdAt
    );
  }
}
