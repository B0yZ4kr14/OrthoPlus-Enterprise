export interface ItemVenda {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
}

export class Venda {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly caixaId: string,
    public items: ItemVenda[],
    public total: number,
    public desconto: number,
    public totalFinal: number,
    public formaPagamento: 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CRYPTO',
    public status: 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA',
    public clienteId: string | null,
    public observacoes: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(props: Omit<Venda, 'adicionarItem' | 'removerItem' | 'aplicarDesconto' | 'concluir' | 'cancelar'>): Venda {
    return new Venda(
      props.id,
      props.clinicId,
      props.caixaId,
      props.items,
      props.total,
      props.desconto,
      props.totalFinal,
      props.formaPagamento,
      props.status,
      props.clienteId,
      props.observacoes,
      props.createdAt,
      props.updatedAt
    );
  }

  adicionarItem(item: ItemVenda): void {
    this.items.push(item);
    this.recalcularTotal();
    this.updatedAt = new Date();
  }

  removerItem(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      this.recalcularTotal();
      this.updatedAt = new Date();
    }
  }

  aplicarDesconto(percentual: number): void {
    if (percentual < 0 || percentual > 100) {
      throw new Error('Desconto deve estar entre 0 e 100');
    }
    this.desconto = percentual;
    this.totalFinal = this.total * (1 - percentual / 100);
    this.updatedAt = new Date();
  }

  concluir(formaPagamento: Venda['formaPagamento']): void {
    if (this.status !== 'PENDENTE') {
      throw new Error('Apenas vendas pendentes podem ser concluídas');
    }
    this.formaPagamento = formaPagamento;
    this.status = 'CONCLUIDA';
    this.updatedAt = new Date();
  }

  cancelar(): void {
    if (this.status === 'CONCLUIDA') {
      throw new Error('Não é possível cancelar uma venda concluída');
    }
    this.status = 'CANCELADA';
    this.updatedAt = new Date();
  }

  private recalcularTotal(): void {
    this.total = this.items.reduce((sum, item) => sum + item.total, 0);
    this.totalFinal = this.total * (1 - this.desconto / 100);
  }
}
