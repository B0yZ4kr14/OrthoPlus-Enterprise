export class Produto {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public nome: string,
    public codigo: string,
    public descricao: string | null,
    public categoria: string,
    public unidadeMedida: string,
    public precoCusto: number,
    public precoVenda: number,
    public quantidadeMinima: number,
    public quantidadeAtual: number,
    public status: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(props: Omit<Produto, 'adicionarEstoque' | 'removerEstoque' | 'ajustarEstoque' | 'estaEmEstoqueBaixo' | 'atualizarPrecos' | 'toObject'>): Produto {
    return new Produto(
      props.id,
      props.clinicId,
      props.nome,
      props.codigo,
      props.descricao,
      props.categoria,
      props.unidadeMedida,
      props.precoCusto,
      props.precoVenda,
      props.quantidadeMinima,
      props.quantidadeAtual,
      props.status,
      props.createdAt,
      props.updatedAt
    );
  }

  adicionarEstoque(quantidade: number): void {
    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser positiva');
    }
    this.quantidadeAtual += quantidade;
    this.updatedAt = new Date();
  }

  removerEstoque(quantidade: number): void {
    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser positiva');
    }
    if (quantidade > this.quantidadeAtual) {
      throw new Error('Estoque insuficiente');
    }
    this.quantidadeAtual -= quantidade;
    this.updatedAt = new Date();
  }

  ajustarEstoque(novaQuantidade: number): void {
    if (novaQuantidade < 0) {
      throw new Error('Quantidade não pode ser negativa');
    }
    this.quantidadeAtual = novaQuantidade;
    this.updatedAt = new Date();
  }

  estaEmEstoqueBaixo(): boolean {
    return this.quantidadeAtual <= this.quantidadeMinima;
  }

  atualizarPrecos(precoCusto: number, precoVenda: number): void {
    this.precoCusto = precoCusto;
    this.precoVenda = precoVenda;
    this.updatedAt = new Date();
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      clinicId: this.clinicId,
      nome: this.nome,
      codigo: this.codigo,
      descricao: this.descricao,
      categoria: this.categoria,
      unidadeMedida: this.unidadeMedida,
      precoCusto: this.precoCusto,
      precoVenda: this.precoVenda,
      quantidadeMinima: this.quantidadeMinima,
      quantidadeAtual: this.quantidadeAtual,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
