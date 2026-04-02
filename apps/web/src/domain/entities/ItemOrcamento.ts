/**
 * Entidade de Item de Orçamento
 * Representa um item/procedimento dentro de um orçamento
 */

export interface ItemOrcamentoProps {
  id: string;
  orcamentoId: string;
  procedimentoId?: string;
  descricao: string;
  denteRegiao?: string;
  quantidade: number;
  valorUnitario: number;
  descontoPercentual: number;
  descontoValor: number;
  valorTotal: number;
  ordem: number;
  observacoes?: string;
  createdAt: Date;
}

export class ItemOrcamento {
  private constructor(private props: ItemOrcamentoProps) {}

  /**
   * Factory method para criar novo item
   */
  static create(
    props: Omit<ItemOrcamentoProps, "id" | "createdAt" | "valorTotal">,
  ): ItemOrcamento {
    // Validações de domínio
    if (!props.orcamentoId?.trim()) {
      throw new Error("ID do orçamento é obrigatório");
    }

    if (!props.descricao?.trim()) {
      throw new Error("Descrição do item é obrigatória");
    }

    if (props.quantidade <= 0) {
      throw new Error("Quantidade deve ser maior que zero");
    }

    if (props.valorUnitario < 0) {
      throw new Error("Valor unitário não pode ser negativo");
    }

    if (props.descontoPercentual < 0 || props.descontoPercentual > 100) {
      throw new Error("Desconto percentual deve estar entre 0 e 100");
    }

    if (props.descontoValor < 0) {
      throw new Error("Desconto em valor não pode ser negativo");
    }

    // Calcular valor total
    const subtotal = props.quantidade * props.valorUnitario;
    const valorTotal = subtotal - props.descontoValor;

    return new ItemOrcamento({
      ...props,
      id: crypto.randomUUID(),
      valorTotal,
      createdAt: new Date(),
    });
  }

  /**
   * Factory method para restaurar item do banco
   */
  static restore(props: ItemOrcamentoProps): ItemOrcamento {
    return new ItemOrcamento(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get orcamentoId(): string {
    return this.props.orcamentoId;
  }

  get procedimentoId(): string | undefined {
    return this.props.procedimentoId;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get denteRegiao(): string | undefined {
    return this.props.denteRegiao;
  }

  get quantidade(): number {
    return this.props.quantidade;
  }

  get valorUnitario(): number {
    return this.props.valorUnitario;
  }

  get descontoPercentual(): number {
    return this.props.descontoPercentual;
  }

  get descontoValor(): number {
    return this.props.descontoValor;
  }

  get valorTotal(): number {
    return this.props.valorTotal;
  }

  get ordem(): number {
    return this.props.ordem;
  }

  get observacoes(): string | undefined {
    return this.props.observacoes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Domain Methods

  /**
   * Atualiza quantidade
   */
  atualizarQuantidade(quantidade: number): void {
    if (quantidade <= 0) {
      throw new Error("Quantidade deve ser maior que zero");
    }

    this.props.quantidade = quantidade;
    this.recalcularValorTotal();
  }

  /**
   * Atualiza valor unitário
   */
  atualizarValorUnitario(valor: number): void {
    if (valor < 0) {
      throw new Error("Valor unitário não pode ser negativo");
    }

    this.props.valorUnitario = valor;
    this.recalcularValorTotal();
  }

  /**
   * Aplica desconto percentual
   */
  aplicarDescontoPercentual(percentual: number): void {
    if (percentual < 0 || percentual > 100) {
      throw new Error("Desconto percentual deve estar entre 0 e 100");
    }

    const subtotal = this.props.quantidade * this.props.valorUnitario;
    this.props.descontoPercentual = percentual;
    this.props.descontoValor = subtotal * (percentual / 100);
    this.recalcularValorTotal();
  }

  /**
   * Aplica desconto em valor
   */
  aplicarDescontoValor(valor: number): void {
    if (valor < 0) {
      throw new Error("Desconto em valor não pode ser negativo");
    }

    const subtotal = this.props.quantidade * this.props.valorUnitario;
    if (valor > subtotal) {
      throw new Error("Desconto não pode ser maior que o subtotal");
    }

    this.props.descontoValor = valor;
    this.props.descontoPercentual = (valor / subtotal) * 100;
    this.recalcularValorTotal();
  }

  /**
   * Atualiza ordem do item
   */
  atualizarOrdem(ordem: number): void {
    if (ordem < 0) {
      throw new Error("Ordem não pode ser negativa");
    }

    this.props.ordem = ordem;
  }

  /**
   * Atualiza observações
   */
  atualizarObservacoes(observacoes: string): void {
    this.props.observacoes = observacoes;
  }

  /**
   * Recalcula valor total
   */
  private recalcularValorTotal(): void {
    const subtotal = this.props.quantidade * this.props.valorUnitario;
    this.props.valorTotal = subtotal - this.props.descontoValor;
  }

  /**
   * Calcula subtotal (sem desconto)
   */
  getSubtotal(): number {
    return this.props.quantidade * this.props.valorUnitario;
  }

  /**
   * Converte para objeto plano
   */
  toObject(): ItemOrcamentoProps {
    return { ...this.props };
  }
}
